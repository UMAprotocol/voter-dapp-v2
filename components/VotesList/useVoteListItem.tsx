import { grey100, isEarlyVote } from "constant";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import {
  formatVoteStringWithPrecision,
  getPrecisionForIdentifier,
} from "helpers";
import { useCallback, useEffect, useState } from "react";
import { DropdownItemT, VoteT } from "types";
import { VotesListProps } from "./VotesList";

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
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const isRolled = rollCount > 0;
  const decryptedVoteAsFormattedString =
    decryptedVote?.price !== undefined
      ? formatVoteStringWithPrecision(decryptedVote.price, decodedIdentifier)
      : undefined;
  const selectedVote = selectedVotes[vote.uniqueKey];
  const showVoteInput = activityStatus === "active" && phase === "commit";
  const showYourVote =
    (activityStatus === "active" && phase === "reveal") ||
    activityStatus === "past";
  const showCorrectVote =
    activityStatus === "past" && correctVote !== undefined;
  const showVoteStatus = activityStatus === "active";
  const borderColor =
    activityStatus === "past" || phase === "reveal" ? grey100 : "transparent";
  const showRolledVoteExplanation = isRolled && !isV1;
  const voteNumber =
    !!resolvedPriceRequestIndex && !isV1
      ? resolvedPriceRequestIndex
      : undefined;

  const formattedDate = format(timeAsDate, "Pp", {
    // en-CA is the only locale that uses the correct
    // format for the date
    // yyyy-mm-dd
    locale: enCA,
  });
  const formattedCorrectVote = getCorrectVote();
  const formattedUserVote = getYourVote();
  const showDropdown = options !== undefined && !isCustomInput;
  const existingOrSelectedVote = getExistingOrSelectedVoteFromOptions();

  useEffect(() => {
    // if options exist but the existing decrypted vote is not one from the list,
    // then we must be using a custom input
    if (
      decryptedVoteAsFormattedString &&
      !findVoteInOptionsDetectEarlyVote(decryptedVoteAsFormattedString)
    ) {
      setIsCustomInput(true);
    }
  }, [decryptedVoteAsFormattedString]);

  useEffect(() => {
    // Function returns true if the input exist and has changed from our committed value, false otherwise
    function isDirtyCheck() {
      if (phase !== "commit") return false;
      if (!decryptedVoteAsFormattedString) return false;
      // this happens if you clear the vote inputs, selected vote normally
      // would be "" if editing. dirty = false if we clear inputs.
      if (selectedVote === undefined) return false;
      return selectedVote !== decryptedVoteAsFormattedString;
    }
    const dirty = isDirtyCheck();
    if (setDirty && dirty !== isDirty?.(vote.uniqueKey)) {
      setDirty(dirty, vote.uniqueKey);
    }
  }, [
    selectedVote,
    setDirty,
    isDirty,
    decryptedVoteAsFormattedString,
    phase,
    vote.uniqueKey,
  ]);

  function onSelectVoteInDropdown(option: DropdownItemT) {
    if (option.value === "custom") {
      selectVote?.("", vote);
      setIsCustomInput(true);
    } else {
      selectVote?.(option.value.toString(), vote);
    }
  }

  function exitCustomInput() {
    clearSelectedVote?.(vote);
    setIsCustomInput(false);
  }

  function getExistingOrSelectedVoteFromOptions() {
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

  function getYourVote() {
    if (!decryptedVote && isCommitted) {
      return "Unknown";
    }
    if (!decryptedVote) return "Did not vote";
    return (
      findVoteInOptionsDetectEarlyVote(decryptedVoteAsFormattedString)?.label ??
      formatVoteStringWithPrecision(
        decryptedVote?.price?.toString(),
        decodedIdentifier
      )
    );
  }

  function getCorrectVote() {
    if (correctVote === undefined) return;
    const formatted = formatVoteStringWithPrecision(
      correctVote,
      decodedIdentifier
    );

    return findVoteInOptionsDetectEarlyVote(formatted)?.label ?? formatted;
  }

  function findVoteInOptions(value: string | undefined) {
    return options?.find((option) => {
      return option.value === value;
    });
  }
  function findVoteInOptionsDetectEarlyVote(value: string | undefined) {
    if (isEarlyVote(value)) return { label: "Early request" };
    return findVoteInOptions(value);
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
    origin,
    title,
    options: options ?? [],
    showRolledVoteExplanation,
    showVoteInput,
    voteNumber,
    formattedDate,
    showYourVote,
    showCorrectVote,
    showVoteStatus,
    formattedCorrectVote,
    formattedUserVote,
    isFetching,
    isDirty: isDirty(vote.uniqueKey),
    borderColor,
    onMoreDetails,
    showDropdown,
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
  };
}

export type VoteListItemHookResult = ReturnType<typeof useVoteListItem>;
