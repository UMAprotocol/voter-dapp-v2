import { VoteT } from "types";
import { shouldAutoAdvance } from "./shouldAutoAdvance";

type SelectVote = (
  value: string | undefined,
  vote: VoteT,
  options?: { skipHighlight?: boolean }
) => void;

/**
 * Builds the vote-selection handler shared by the click path
 * (VotePanelVoteInput) and the keyboard path (useVotePanelKeyboard). When
 * auto-advance is on, choosing an option also rolls the panel forward to the
 * next vote. Kept out of the component so the chaining can be unit-tested
 * without rendering.
 *
 * Returns `undefined` when there is no underlying `selectVote` (e.g. the panel
 * was opened without vote-selection, such as the reveal phase), so callers can
 * gate the input the same way they did before.
 */
export function makeAutoAdvanceSelectVote({
  selectVote,
  enabled,
  canGoNext,
  goToNextVote,
}: {
  selectVote: SelectVote | undefined;
  enabled: boolean;
  canGoNext: boolean;
  goToNextVote: () => void;
}): ((value: string | undefined, vote: VoteT) => void) | undefined {
  if (!selectVote) return undefined;
  return (value: string | undefined, vote: VoteT) => {
    const willAutoAdvance = shouldAutoAdvance({ enabled, value, canGoNext });
    // Suppress the just-selected vote's highlight when advancing so we don't
    // fire two smooth scrolls back-to-back (goToNextVote scrolls to the next
    // vote in the same tick). We call goToNextVote directly, not the chevron's
    // handleNext, so its red flash stays a manual-tap affordance.
    selectVote(value, vote, { skipHighlight: willAutoAdvance });
    if (willAutoAdvance) {
      goToNextVote();
    }
  };
}
