import { useEffect } from "react";
import { DropdownItemT, VoteT } from "types";

export function useVotePanelKeyboard({
  isActive,
  goToPrevVote,
  goToNextVote,
  canGoPrev,
  canGoNext,
  options,
  currentVote,
  selectVote,
}: {
  isActive: boolean;
  goToPrevVote: () => void;
  goToNextVote: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  options: DropdownItemT[] | undefined;
  currentVote: VoteT | undefined;
  selectVote: ((value: string | undefined, vote: VoteT) => void) | undefined;
}) {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT")
        return;

      if (e.key === "ArrowLeft" && canGoPrev) {
        e.preventDefault();
        goToPrevVote();
        return;
      }

      if (e.key === "ArrowRight" && canGoNext) {
        e.preventDefault();
        goToNextVote();
        return;
      }

      if (selectVote && currentVote && options?.length) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= options.length) {
          e.preventDefault();
          selectVote(options[num - 1].value.toString(), currentVote);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isActive,
    goToPrevVote,
    goToNextVote,
    canGoPrev,
    canGoNext,
    options,
    currentVote,
    selectVote,
  ]);
}
