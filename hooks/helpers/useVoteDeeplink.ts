import { useQuery, useQueryClient } from "@tanstack/react-query";
import { emitErrorEvent } from "helpers";
import {
  externalDeeplinkQueryParams,
  parseVoteDeeplink,
  pathForActivityStatus,
  ResolvedVoteDeeplink,
  voteDeeplinkQueryParam,
} from "helpers/util/deeplink";
import { makeProvisionalVote } from "helpers/voting/makeProvisionalVote";
import { hasL2AncillaryDataStamp } from "lib/deeplink-matching";
import { usePanelContext } from "hooks/contexts/usePanelContext";
import { useVotesContext } from "hooks/contexts/useVotesContext";
import { useVotesWithOnScreenData } from "hooks/queries/votes/useVotesWithOnScreenData";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
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
 *
 * The resolver returns the price request itself, so while the app's vote
 * lists are still loading the panel opens with a PROVISIONAL vote built from
 * that entity (the logged-out view, no prev/next). Once the lists arrive the
 * canonical vote is swapped in through the same showVote path that handles
 * every other vote-to-vote transition.
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

  const queryClient = useQueryClient();

  const parsed = router.isReady ? parseVoteDeeplink(router.query) : undefined;
  const external = parsed?.form === "external" ? parsed : undefined;
  const targetKey = parsed?.form === "uniqueKey" ? parsed.uniqueKey : undefined;

  // isInitialLoading, not isLoading: a disabled list query (wrong chain,
  // graph off) reports isLoading forever, which would leave the deeplink
  // stuck waiting instead of surfacing the not-found notification
  const votesStillLoading =
    activeVotesIsInitialLoading ||
    upcomingVotesIsInitialLoading ||
    pastVotesIsInitialLoading;
  const targetFromLists = useMemo(() => {
    if (!targetKey) return undefined;
    for (const status of activityStatuses) {
      const vote = voteListsByActivityStatus[status]?.find(
        (vote) => vote.uniqueKey === targetKey
      );
      if (vote) return { vote, status };
    }
    return undefined;
  }, [targetKey, voteListsByActivityStatus]);
  const targetInLists = !!targetFromLists;

  // past votes come out of the lists with unresolved L2 ancillary data (it is
  // resolved lazily for on-screen rows), but the panel derives its title and
  // description from it — resolve the deeplinked vote before showing it
  const targetVotesToResolve = useMemo(
    () => (targetFromLists ? [targetFromLists.vote] : []),
    [targetFromLists]
  );
  const [resolvedTargetVote] = useVotesWithOnScreenData(targetVotesToResolve);
  // still carrying the stamp = resolution in flight (or failed)
  const targetResolutionPending =
    !!resolvedTargetVote &&
    hasL2AncillaryDataStamp(resolvedTargetVote.decodedAncillaryData);

  // canonical links: fetch the entity so the panel can render before the
  // lists load; external links seed this cache from their own resolution
  const { data: targetEntity } = useQuery({
    queryKey: ["voteDeeplinkEntity", targetKey],
    queryFn: async (): Promise<ResolvedVoteDeeplink> => {
      const params = new URLSearchParams({ vote: targetKey ?? "" });
      const response = await fetch(
        `/api/resolve-deeplink?${params.toString()}`
      );
      if (!response.ok) throw new Error("Deeplink entity fetch failed");
      return (await response.json()) as ResolvedVoteDeeplink;
    },
    enabled: !!targetKey && !targetInLists && votesStillLoading,
    staleTime: Infinity,
    retry: 1,
  });

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
    // the external resolution already carries the entity — seed the canonical
    // key's cache so the provisional panel opens without a second fetch
    queryClient.setQueryData(
      ["voteDeeplinkEntity", resolved.uniqueKey],
      resolved
    );
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

  // the vote panel is showing a provisional build of this key, awaiting the
  // canonical vote from the lists
  const provisionalKeyRef = useRef<string>();

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
      provisionalKeyRef.current = undefined;
      // close a showing vote panel — a plain closePanel pops back to
      // whatever panel the vote was stacked on (e.g. the history panel)
      if (voteShowing) {
        expectedVoteRef.current = undefined;
        closePanel();
      }
      return;
    }

    // a provisional panel with the right key still needs its canonical
    // upgrade, so it does not count as "in sync"; nor does a panel showing
    // the vote whose lazily-loaded content (L2 ancillary data, UMIP metadata
    // for governance votes) has since landed. contentfulData is compared by
    // reference: both sides come from the same react-query cache entry
    const upgradingProvisional = provisionalKeyRef.current === targetKey;
    const panelHasStaleContent =
      panelContent?.uniqueKey === targetKey &&
      !!resolvedTargetVote &&
      (panelContent.ancillaryDataL2 !== resolvedTargetVote.ancillaryDataL2 ||
        panelContent.contentfulData !== resolvedTargetVote.contentfulData);
    if (
      voteShowing &&
      panelContent?.uniqueKey === targetKey &&
      !upgradingProvisional &&
      !panelHasStaleContent
    ) {
      return;
    }

    const selfInitiated = expected?.key === targetKey;

    // a non-vote panel is on top and didn't ask for this vote (e.g. a menu
    // covering the vote the param still describes) — leave both alone
    if (panelOpen && panelType !== "vote" && !selfInitiated) return;

    // the provisional vote carries server-resolved ancillary data — swapping
    // it for a canonical vote whose lazy resolution hasn't landed yet would
    // briefly downgrade the panel; wait for the resolved version (the effect
    // re-runs when it arrives)
    if (upgradingProvisional && voteShowing && targetResolutionPending) return;

    const vote: VoteT | undefined = resolvedTargetVote ?? targetFromLists?.vote;
    const status: ActivityStatusT | undefined = targetFromLists?.status;

    if (!vote || !status) {
      const entity =
        targetEntity?.uniqueKey === targetKey ? targetEntity : undefined;
      if (votesStillLoading) {
        // show what the resolver already knows instead of waiting for the
        // full vote lists; entity errors just fall back to the waiting path
        if (!entity?.request) return;
        const pathname = pathForActivityStatus[entity.activityStatus];
        if (!selfInitiated && !panelOpen && router.pathname !== pathname) {
          void router.replace({ pathname, query: router.query }, undefined, {
            scroll: false,
          });
          return;
        }
        if (voteShowing && panelContent?.uniqueKey === targetKey) return;
        const provisional = makeProvisionalVote(
          entity.request,
          entity.uniqueKey
        );
        if (voteShowing) {
          showVote(provisional, []);
        } else {
          openPanel("vote", provisional, { navigableVotes: [] });
        }
        provisionalKeyRef.current = targetKey;
        // consumed once the lists render the row
        if (!selfInitiated || expected?.scroll) requestVoteScroll(targetKey);
        expectedVoteRef.current = undefined;
        return;
      }
      // the lists are loaded and lack the vote, but a provisional panel is
      // showing it: the resolver's entity is authoritative, lists can lag
      if (upgradingProvisional && voteShowing) return;
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
    // a provisional upgrade already requested its scroll when it opened; a
    // stale-content upgrade swaps content in place and must not re-scroll
    if (
      (!selfInitiated || expected?.scroll) &&
      !upgradingProvisional &&
      !panelHasStaleContent
    ) {
      requestVoteScroll(targetKey);
    }
    provisionalKeyRef.current = undefined;
    expectedVoteRef.current = undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetKey,
    targetEntity,
    targetFromLists,
    resolvedTargetVote,
    router.isReady,
    router.pathname,
    panelOpen,
    panelType,
    panelContent,
    voteListsByActivityStatus,
    votesStillLoading,
  ]);
}
