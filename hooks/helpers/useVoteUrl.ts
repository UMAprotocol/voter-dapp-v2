import {
  externalDeeplinkQueryParams,
  getVoteDeeplinkParam,
  voteDeeplinkQueryParam,
} from "helpers/util/deeplink";
import { usePanelContext } from "hooks/contexts/usePanelContext";
import { useRouter } from "next/router";
import { useCallback } from "react";

/**
 * The URL is the single source of truth for which vote panel is open: every
 * in-app way of opening, switching, or closing a vote writes only the
 * `?vote=` param (shallow, so no data refetch), and useVoteDeeplink derives
 * the panel state from the router. That makes the address bar the shareable
 * link for free and leaves exactly one code path — URL → panel — however a
 * vote is opened: row click, panel arrows, inbound link, back/forward.
 */
export function useVoteUrl() {
  const router = useRouter();
  const { expectedVoteRef, closePanel } = usePanelContext();

  // row clicks: push so the browser back button closes the panel
  const openVote = useCallback(
    (uniqueKey: string) => {
      expectedVoteRef.current = { key: uniqueKey, scroll: false };
      const query = { ...router.query };
      externalDeeplinkQueryParams.forEach((param) => delete query[param]);
      query[voteDeeplinkQueryParam] = uniqueKey;
      void router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router, expectedVoteRef]
  );

  // panel arrows: replace, so paging through votes doesn't spam history;
  // the row navigated to scrolls into view like it always has
  const switchVote = useCallback(
    (uniqueKey: string) => {
      expectedVoteRef.current = { key: uniqueKey, scroll: true };
      const query = { ...router.query };
      externalDeeplinkQueryParams.forEach((param) => delete query[param]);
      query[voteDeeplinkQueryParam] = uniqueKey;
      void router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router, expectedVoteRef]
  );

  const closeVote = useCallback(() => {
    expectedVoteRef.current = undefined;
    if (getVoteDeeplinkParam(router.query) === undefined) {
      // no param to clean up (the panel outlived its param, e.g. after a
      // back-navigation while another panel covered it) — close directly
      closePanel();
      return;
    }
    const query = { ...router.query };
    delete query[voteDeeplinkQueryParam];
    void router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [router, expectedVoteRef, closePanel]);

  return { openVote, switchVote, closeVote };
}
