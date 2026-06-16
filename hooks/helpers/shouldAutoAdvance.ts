/**
 * Decides whether selecting a vote option should roll the panel forward to the
 * next vote. Pure so it can be unit-tested without rendering the panel.
 *
 * - `enabled`: the user's auto-advance preference (off by default).
 * - `value`: the option just chosen; `undefined` means the user *deselected*,
 *   in which case we stay put rather than skipping over an unanswered vote.
 * - `canGoNext`: false on the last vote in the round, so we never advance past
 *   the end and strand the user away from the commit action.
 */
export function shouldAutoAdvance({
  enabled,
  value,
  canGoNext,
}: {
  enabled: boolean;
  value: string | undefined;
  canGoNext: boolean;
}): boolean {
  return enabled && value !== undefined && canGoNext;
}
