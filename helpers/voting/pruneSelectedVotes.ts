import { SelectedVotesByKeyT } from "types";

/** Drops selections whose uniqueKey is not an active vote.
 *
 * Persisted selections are guarded by a clock-derived roundId
 * (`computeRoundId`), so a skewed client clock can stamp one round's
 * selections with another round's id and leak them across rounds. The
 * on-chain active list is the source of truth, so anything outside it is
 * stale. Returns the input object untouched when nothing is stale, so
 * effects keyed on the result don't loop.
 */
export function pruneSelectedVotes(
  selected: SelectedVotesByKeyT,
  activeKeys: ReadonlySet<string>
): SelectedVotesByKeyT {
  const staleKeys = Object.keys(selected).filter((key) => !activeKeys.has(key));
  if (staleKeys.length === 0) return selected;

  const pruned = { ...selected };
  for (const key of staleKeys) {
    delete pruned[key];
  }
  return pruned;
}
