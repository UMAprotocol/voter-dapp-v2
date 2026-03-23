import { useEffect } from "react";
import { DropdownItemT, VoteT } from "types";
import { getSelectableQuickOptions } from "helpers/voting/getSelectableQuickOptions";

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

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        if (canGoPrev) goToPrevVote();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        if (canGoNext) goToNextVote();
        return;
      }

      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT")
        return;

      if (selectVote && currentVote && options?.length) {
        const selectableOptions = getSelectableQuickOptions(options);
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= selectableOptions.length) {
          e.preventDefault();
          selectVote(selectableOptions[num - 1].value.toString(), currentVote);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
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
