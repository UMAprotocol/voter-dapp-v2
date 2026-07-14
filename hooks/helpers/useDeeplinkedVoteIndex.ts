import { getVoteDeeplinkParam } from "helpers/util/deeplink";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import { VoteT } from "types";

/**
 * Index of the vote `?vote=` points to within the given list, for driving
 * `usePagination(votes, findIndex)` to the vote's page. Reported once per
 * key — afterwards it returns undefined so the user can page freely while
 * the panel (and its URL param) stays open.
 */
export function useDeeplinkedVoteIndex(votes: VoteT[] | undefined) {
  const router = useRouter();
  const appliedKeyRef = useRef<string>();
  const targetKey = router.isReady
    ? getVoteDeeplinkParam(router.query)
    : undefined;

  const index = useMemo(() => {
    if (!targetKey || appliedKeyRef.current === targetKey || !votes?.length) {
      return undefined;
    }
    const found = votes.findIndex(({ uniqueKey }) => uniqueKey === targetKey);
    return found === -1 ? undefined : found;
  }, [targetKey, votes]);

  useEffect(() => {
    if (!targetKey) {
      appliedKeyRef.current = undefined;
    } else if (index !== undefined) {
      appliedKeyRef.current = targetKey;
    }
  }, [index, targetKey]);

  return index;
}
