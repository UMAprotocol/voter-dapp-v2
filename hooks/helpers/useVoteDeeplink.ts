import { useQuery } from "@tanstack/react-query";
import { scrollToAndHighlightVote } from "contexts";
import { emitErrorEvent } from "helpers";
import {
  externalDeeplinkQueryParams,
  parseVoteDeeplink,
  pathForActivityStatus,
  ResolvedVoteDeeplink,
  voteDeeplinkQueryParam,
} from "helpers/util/deeplink";
import { usePanelContext } from "hooks/contexts/usePanelContext";
import { useVotesContext } from "hooks/contexts/useVotesContext";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useRef } from "react";
import { ActivityStatusT } from "types";

const activityStatuses: ActivityStatusT[] = ["active", "upcoming", "past"];

function getVoteParam(query: ParsedUrlQuery) {
  const value = query[voteDeeplinkQueryParam];
  return Array.isArray(value) ? value[0] : value;
}

function notifyVoteNotFound() {
  emitErrorEvent({
    message: "Unable to find the vote this link points to.",
    pendingId: "vote-deeplink-error",
  });
}

/**
 * Two-way sync between the URL and the vote details panel:
 * - inbound `?vote=` / `?identifier=&time=&ancillaryData=` params open the
 *   panel on the correct page once vote data is available
 * - an open vote panel writes `?vote=<uniqueKey>` to the address bar (shallow,
 *   so the panel survives), making the URL itself the shareable deeplink
 *
 * The URL-sync effect acts on TRANSITIONS (panel just opened/closed, param
 * just disappeared), never on plain state. Effects in one commit see sibling
 * state updates and router changes with a delay, so state-based conditions
 * here misfire and fight each other (open panel <-> strip param loops).
 */
export function useVoteDeeplink() {
  const router = useRouter();
  const { panelType, panelContent, panelOpen, openPanel, closePanel } =
    usePanelContext();
  const {
    voteListsByActivityStatus,
    activeVotesIsLoading,
    upcomingVotesIsLoading,
    pastVotesIsLoading,
  } = useVotesContext();

  const parsed = router.isReady ? parseVoteDeeplink(router.query) : undefined;
  const external = parsed?.form === "external" ? parsed : undefined;
  const targetKey = parsed?.form === "uniqueKey" ? parsed.uniqueKey : undefined;

  // the key we already acted on, so the open-effect runs once per inbound link
  const handledKeyRef = useRef<string>();
  // previous values, so the URL-sync effect can detect transitions
  const prevOpenKeyRef = useRef<string>();
  const prevParamRef = useRef<string>();
  // during a real page navigation we must not fire shallow replaces to clean
  // up params — they would abort the navigation, and the destination route
  // doesn't carry the param anyway
  const navigatingRef = useRef(false);

  useEffect(() => {
    function handleStart(_url: string, { shallow }: { shallow: boolean }) {
      if (!shallow) navigatingRef.current = true;
    }
    function handleSettled() {
      navigatingRef.current = false;
    }
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleSettled);
    router.events.on("routeChangeError", handleSettled);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleSettled);
      router.events.off("routeChangeError", handleSettled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: resolved, isError: resolveFailed } = useQuery({
    queryKey: ["resolveDeeplink", external],
    queryFn: async (): Promise<ResolvedVoteDeeplink> => {
      if (!external) throw new Error("no deeplink params");
      const params = new URLSearchParams({
        identifier: external.identifier,
        time: String(external.time),
      });
      if (external.ancillaryData) {
        params.set("ancillaryData", external.ancillaryData);
      }
      const response = await fetch(
        `/api/resolve-deeplink?${params.toString()}`
      );
      if (!response.ok) throw new Error("Deeplink resolution failed");
      return (await response.json()) as ResolvedVoteDeeplink;
    },
    enabled: !!external,
    staleTime: Infinity,
    retry: 1,
  });

  // rewrite external params to the canonical `?vote=` form on the right page
  useEffect(() => {
    if (!external) return;
    if (resolveFailed) {
      notifyVoteNotFound();
      return;
    }
    if (!resolved) return;
    const pathname = pathForActivityStatus[resolved.activityStatus];
    const query = { ...router.query };
    externalDeeplinkQueryParams.forEach((param) => delete query[param]);
    query[voteDeeplinkQueryParam] = resolved.uniqueKey;
    void router.replace({ pathname, query }, undefined, {
      shallow: pathname === router.pathname,
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [external?.identifier, external?.time, resolved, resolveFailed]);

  // inbound `?vote=<uniqueKey>`: find the vote, switch pages if needed, open
  useEffect(() => {
    if (!targetKey || handledKeyRef.current === targetKey) return;

    if (
      panelOpen &&
      panelType === "vote" &&
      panelContent?.uniqueKey === targetKey
    ) {
      // the panel wrote this param itself, nothing to do
      handledKeyRef.current = targetKey;
      return;
    }

    for (const status of activityStatuses) {
      const votes = voteListsByActivityStatus[status];
      const vote = votes?.find(({ uniqueKey }) => uniqueKey === targetKey);
      if (!vote) continue;

      const pathname = pathForActivityStatus[status];
      if (router.pathname !== pathname) {
        void router.replace({ pathname, query: router.query }, undefined, {
          scroll: false,
        });
        return;
      }
      handledKeyRef.current = targetKey;
      openPanel("vote", vote, { navigableVotes: votes });
      scrollToAndHighlightVote(targetKey);
      return;
    }

    const stillLoading =
      activeVotesIsLoading || upcomingVotesIsLoading || pastVotesIsLoading;
    if (!stillLoading) {
      handledKeyRef.current = targetKey;
      notifyVoteNotFound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetKey,
    router.pathname,
    panelOpen,
    panelType,
    panelContent,
    voteListsByActivityStatus,
    activeVotesIsLoading,
    upcomingVotesIsLoading,
    pastVotesIsLoading,
  ]);

  // keep the URL in sync with the panel, reacting only to transitions
  useEffect(() => {
    if (!router.isReady) return;
    const param = getVoteParam(router.query);
    const openKey =
      panelOpen && panelType === "vote" ? panelContent?.uniqueKey : undefined;
    const prevOpenKey = prevOpenKeyRef.current;
    const prevParam = prevParamRef.current;
    prevOpenKeyRef.current = openKey;
    prevParamRef.current = param;

    // panel just opened or switched to another vote -> write the param;
    // push (not replace) so the browser back button closes the panel
    if (openKey && openKey !== prevOpenKey) {
      handledKeyRef.current = openKey;
      if (param !== openKey) {
        const query = { ...router.query };
        externalDeeplinkQueryParams.forEach((key) => delete query[key]);
        query[voteDeeplinkQueryParam] = openKey;
        void router.push({ pathname: router.pathname, query }, undefined, {
          shallow: true,
          scroll: false,
        });
      }
      return;
    }

    // panel just closed -> remove the param
    if (!openKey && prevOpenKey) {
      handledKeyRef.current = undefined;
      if (param && !navigatingRef.current) {
        const query = { ...router.query };
        delete query[voteDeeplinkQueryParam];
        void router.replace({ pathname: router.pathname, query }, undefined, {
          shallow: true,
          scroll: false,
        });
      }
      return;
    }

    // param just disappeared while the panel is open (back button) -> close
    if (openKey && !param && prevParam) {
      handledKeyRef.current = undefined;
      prevOpenKeyRef.current = undefined;
      closePanel(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen, panelType, panelContent, router.isReady, router.query]);
}
