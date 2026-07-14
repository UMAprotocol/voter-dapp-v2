import { usePanelContext } from "hooks/contexts/usePanelContext";
import { useMemo } from "react";
import { VoteT } from "types";

/**
 * Index of the vote a pending scroll-and-highlight request points to within
 * the given list, for driving `usePagination(votes, findIndex)` to the
 * vote's page so the row can mount and consume the request. Keyed on
 * PanelContext's voteScrollTarget — set for inbound deeplinks and panel-arrow
 * navigation but not for plain row clicks, so in-app opens (e.g. from the
 * history panel) never yank the user's pagination. The target is cleared
 * when the row consumes it, after which this returns undefined and the user
 * can page freely while the panel (and its URL param) stays open.
 */
export function useDeeplinkedVoteIndex(votes: VoteT[] | undefined) {
  const { voteScrollTarget } = usePanelContext();

  return useMemo(() => {
    if (!voteScrollTarget || !votes?.length) return undefined;
    const found = votes.findIndex(
      ({ uniqueKey }) => uniqueKey === voteScrollTarget
    );
    return found === -1 ? undefined : found;
  }, [voteScrollTarget, votes]);
}
