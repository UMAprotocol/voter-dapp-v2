import { useQuery } from "@tanstack/react-query";
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
import { useEffect, useRef } from "react";
import { ActivityStatusT, VoteT } from "types";

const activityStatuses: ActivityStatusT[] = ["active", "upcoming", "past"];

function notifyVoteNotFound() {
  emitErrorEvent({
    message: "Unable to find the vote this link points to.",
    pendingId: "vote-deeplink-error",
  });
}

/**
 * Derives the vote panel from the URL. The `?vote=` param is the single
 * source of truth: useVoteUrl writes it (row clicks, panel arrows, panel
 * close) and this hook is the only place that opens or closes the vote panel
 * in response — the same path handles inbound links, back/forward, and
 * in-app actions, so panel and URL cannot disagree.
 *
 * External-form links (`?identifier=&time=&ancillaryDataHash=`) are resolved
 * server-side first and rewritten to the canonical `?vote=` form.
 *
 * Inbound navigations (nothing initiated in-app via expectedVoteRef) land on
 * the vote's own page and scroll-highlight its row; in-app opens act in
 * place, so e.g. the history panel's rows open votes on whatever page the
 * user is on.
 */
export function useVoteDeeplink() {
  const router = useRouter();
  const {
    panelType,
    panelContent,
    panelOpen,
    openPanel,
    closePanel,
    showVote,
    expectedVoteRef,
    requestVoteScroll,
    clearVoteScroll,
  } = usePanelContext();
  const {
    voteListsByActivityStatus,
    activeVotesIsInitialLoading,
    upcomingVotesIsInitialLoading,
    pastVotesIsInitialLoading,
  } = useVotesContext();

  const parsed = router.isReady ? parseVoteDeeplink(router.query) : undefined;
  const external = parsed?.form === "external" ? parsed : undefined;
  const targetKey = parsed?.form === "uniqueKey" ? parsed.uniqueKey : undefined;

  // While a real page navigation is in flight the router still reports the
  // OLD query, but Nav has already closed the panel — acting on that stale
  // combination would reopen the panel mid-navigation. Wait it out; the
  // deriver re-runs when the route settles (query/pathname change).
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
      if (external.ancillaryDataHash) {
        params.set("ancillaryDataHash", external.ancillaryDataHash);
      } else if (external.ancillaryData) {
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
      // drop the params so the URL doesn't keep pointing at nothing
      const query = { ...router.query };
      externalDeeplinkQueryParams.forEach((param) => delete query[param]);
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
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

  // the deriver: make the panel state match `?vote=`
  useEffect(() => {
    if (!router.isReady || navigatingRef.current) return;
    const voteShowing = panelOpen && panelType === "vote";
    const expected = expectedVoteRef.current;

    if (!targetKey) {
      // param gone (back button, close, page navigation): a pending scroll
      // for a vote whose param is gone must never fire — clear it even when
      // something else (e.g. Nav on navigation) already closed the panel
      clearVoteScroll();
      // close a showing vote panel — a plain closePanel pops back to
      // whatever panel the vote was stacked on (e.g. the history panel)
      if (voteShowing) {
        expectedVoteRef.current = undefined;
        closePanel();
      }
      return;
    }

    if (voteShowing && panelContent?.uniqueKey === targetKey) return;

    const selfInitiated = expected?.key === targetKey;

    // a non-vote panel is on top and didn't ask for this vote (e.g. a menu
    // covering the vote the param still describes) — leave both alone
    if (panelOpen && panelType !== "vote" && !selfInitiated) return;

    let vote: VoteT | undefined;
    let status: ActivityStatusT | undefined;
    for (const s of activityStatuses) {
      vote = voteListsByActivityStatus[s]?.find(
        (v) => v.uniqueKey === targetKey
      );
      if (vote) {
        status = s;
        break;
      }
    }

    if (!vote || !status) {
      // isInitialLoading, not isLoading: a disabled list query (wrong chain,
      // graph off) reports isLoading forever, which would leave the deeplink
      // silently unresolved instead of surfacing the not-found notification
      const stillLoading =
        activeVotesIsInitialLoading ||
        upcomingVotesIsInitialLoading ||
        pastVotesIsInitialLoading;
      if (stillLoading) return; // effect re-runs when the lists arrive
      expectedVoteRef.current = undefined;
      notifyVoteNotFound();
      const query = { ...router.query };
      delete query[voteDeeplinkQueryParam];
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
      return;
    }

    // an inbound link with nothing open lands on the vote's own page so the
    // highlighted row is visible behind the panel; in-app opens stay put
    const pathname = pathForActivityStatus[status];
    if (!selfInitiated && !panelOpen && router.pathname !== pathname) {
      void router.replace({ pathname, query: router.query }, undefined, {
        scroll: false,
      });
      return; // effect re-runs once the navigation lands
    }

    const votes = voteListsByActivityStatus[status] ?? [];
    if (voteShowing) {
      showVote(vote, votes);
    } else {
      // openPanel stacks, so a vote opened from the history panel returns
      // there on close
      openPanel("vote", vote, { navigableVotes: votes });
    }
    if (!selfInitiated || expected?.scroll) requestVoteScroll(targetKey);
    expectedVoteRef.current = undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetKey,
    router.isReady,
    router.pathname,
    panelOpen,
    panelType,
    panelContent,
    voteListsByActivityStatus,
    activeVotesIsInitialLoading,
    upcomingVotesIsInitialLoading,
    pastVotesIsInitialLoading,
  ]);
}
