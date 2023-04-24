import { isEarlyVote } from "constant";
import {
  formatDate,
  formatVoteStringWithPrecision,
  getPrecisionForIdentifier,
} from "helpers";
import { useCallback, useEffect, useState } from "react";
import { DropdownItemT, VoteT } from "types";
import { VotesListProps } from "../VotesList";

function findVoteInOptions(
  value: string | undefined,
  options: DropdownItemT[] | undefined
) {
  return options?.find((option) => {
    return option.value === value;
  });
}
function findVoteInOptionsDetectEarlyVote(
  value: string | undefined,
  options: DropdownItemT[] | undefined
) {
  if (isEarlyVote(value)) return { label: "Early request" };
  return findVoteInOptions(value, options);
}

function getExistingOrSelectedVoteFromOptions(
  options: DropdownItemT[] | undefined,
  selectedVote: string | undefined,
  decryptedVoteAsFormattedString: string | undefined
) {
  return options?.find((option) => {
    // prefer showing the selected vote if it exists
    if (selectedVote !== undefined) {
      return option.value === selectedVote;
    }

    if (decryptedVoteAsFormattedString !== undefined) {
      return option.value === decryptedVoteAsFormattedString;
    }
  });
}

export interface VoteListItemProps extends Omit<VotesListProps, "votesToShow"> {
  vote: VoteT;
}
export function useVoteListItem({
  vote,
  phase,
  selectedVotes,
  selectVote,
  clearSelectedVote,
  activityStatus,
  moreDetailsAction,
  isFetching,
  isDirty,
  setDirty,
  delegationStatus,
}: VoteListItemProps) {
  const [isCustomInput, setIsCustomInput] = useState(false);
  const {
    decodedIdentifier,
    title,
    origin,
    options,
    isCommitted,
    commitHash,
    isRevealed,
    revealHash,
    decryptedVote,
    correctVote,
    resolvedPriceRequestIndex,
    isV1,
    timeAsDate,
    canReveal,
    rollCount,
  } = vote;
  const isActive = activityStatus === "active";
  const isPast = activityStatus === "past";
  const isReveal = phase === "reveal";
  const isCommit = phase === "commit";
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const decryptedVoteAsFormattedString =
    decryptedVote?.price !== undefined
      ? formatVoteStringWithPrecision(decryptedVote.price, decodedIdentifier)
      : undefined;
  const isRolled = rollCount > 0;
  const selectedVote = selectedVotes[vote.uniqueKey];
  const voteNumber =
    !!resolvedPriceRequestIndex && !isV1
      ? resolvedPriceRequestIndex
      : undefined;

  const formattedDate = formatDate(timeAsDate);
  const formattedCorrectVote = getFormattedCorrectVote();
  const formattedUserVote = getFormattedUserVote();
  const existingOrSelectedVote = getExistingOrSelectedVoteFromOptions(
    options,
    selectedVote,
    decryptedVoteAsFormattedString
  );

  const showVoteInput = isActive && isCommit;
  const showYourVote = (isActive && isReveal) || isPast;
  const showCorrectVote = isPast && correctVote !== undefined;
  const showDropdown = options !== undefined && !isCustomInput;
  const showVoteStatus = isActive;
  const showRolledVoteExplanation = isRolled && !isV1;

  useEffect(() => {
    // if options exist but the existing decrypted vote is not one from the list,
    // then we must be using a custom input
    if (
      !findVoteInOptionsDetectEarlyVote(decryptedVoteAsFormattedString, options)
    ) {
      setIsCustomInput(true);
    }
  }, [decryptedVoteAsFormattedString, options]);

  useEffect(() => {
    // Function returns true if the input exist and has changed from our committed value, false otherwise
    function runIsDirtyEffect() {
      if (!isCommit) return false;
      if (!decryptedVoteAsFormattedString) return false;
      // this happens if you clear the vote inputs, selected vote normally
      // would be "" if editing. dirty = false if we clear inputs.
      if (selectedVote === undefined) return false;
      return selectedVote !== decryptedVoteAsFormattedString;
    }
    const dirty = runIsDirtyEffect();
    if (setDirty && dirty !== isDirty(vote.uniqueKey)) {
      setDirty(dirty, vote.uniqueKey);
    }
  }, [
    selectedVote,
    setDirty,
    isDirty,
    decryptedVoteAsFormattedString,
    isCommit,
    vote.uniqueKey,
  ]);

  function onSelectVoteInDropdown(option: DropdownItemT) {
    if (option.value === "custom") {
      selectVote("", vote);
      setIsCustomInput(true);
    } else {
      selectVote(option.value.toString(), vote);
    }
  }

  function exitCustomInput() {
    clearSelectedVote(vote);
    setIsCustomInput(false);
  }

  function getFormattedUserVote() {
    if (!decryptedVote && isCommitted) {
      return "Unknown";
    }
    if (!decryptedVote) return "Did not vote";
    return (
      findVoteInOptionsDetectEarlyVote(decryptedVoteAsFormattedString, options)
        ?.label ??
      formatVoteStringWithPrecision(
        decryptedVote?.price?.toString(),
        decodedIdentifier
      )
    );
  }

  function getFormattedCorrectVote() {
    if (correctVote === undefined) return;
    const formatted = formatVoteStringWithPrecision(
      correctVote,
      decodedIdentifier
    );

    return (
      findVoteInOptionsDetectEarlyVote(formatted, options)?.label ?? formatted
    );
  }

  const onMoreDetails = useCallback(
    function () {
      moreDetailsAction(vote);
    },
    [vote, moreDetailsAction]
  );

  function onSelectVoteInTextInput(value: string) {
    selectVote(value, vote);
  }

  return {
    options: options ?? [],
    isDirty: isDirty(vote.uniqueKey),
    origin,
    title,
    showRolledVoteExplanation,
    showVoteInput,
    showYourVote,
    showCorrectVote,
    showVoteStatus,
    showDropdown,
    voteNumber,
    formattedDate,
    formattedCorrectVote,
    formattedUserVote,
    isFetching,
    onMoreDetails,
    selectedVote,
    decryptedVoteAsFormattedString,
    existingOrSelectedVote,
    onSelectVoteInTextInput,
    onSelectVoteInDropdown,
    isCustomInput,
    exitCustomInput,
    maxDecimals,
    rollCount,
    phase,
    isCommitted,
    isRevealed,
    decryptedVote,
    delegationStatus,
    canReveal,
    commitHash,
    revealHash,
    isActive,
    isPast,
    isCommit,
    isReveal,
  };
}

export type VoteListItemHookResult = ReturnType<typeof useVoteListItem>;
