import { green, grey100, isEarlyVote, red500 } from "constant";
import {
  decodeHexString,
  formatVoteStringWithPrecision,
  getPrecisionForIdentifier,
  getClaimTitle,
} from "helpers";
import { config } from "helpers/config";
import {
  useAccountDetails,
  useAssertionClaim,
  useDelegationContext,
  useVotesContext,
  useWalletContext,
} from "hooks";
import Link from "next/link";
import Across from "public/assets/icons/across.svg";
import OSnap from "public/assets/icons/osnap.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import UMAGovernance from "public/assets/icons/uma-governance.svg";
import PredictFunIcon from "public/assets/icons/predict-fun.svg";
import InfiniteGames from "public/assets/icons/infinite-games.svg";
import Probable from "public/assets/icons/probable.svg";
import UMA from "public/assets/icons/uma.svg";
import { CSSProperties, useEffect, useState } from "react";
import removeMarkdown from "remove-markdown";
import { DropdownItemT } from "types";
import { VoteListItemProps } from "./shared.types";
import { useMultipleValuesVote } from "hooks/inputs/useMultipleValuesVote";

export function useVoteListItem({
  vote,
  phase,
  selectedVote,
  selectVote,
  clearVote,
  activityStatus,
  setDirty,
  moreDetailsAction,
  isDirty = false,
  isSelectedForReveal,
  toggleRevealSelection,
  canBeRevealed,
}: VoteListItemProps) {
  const [isCustomInput, setIsCustomInput] = useState(false);
  const multipleInputProps = useMultipleValuesVote({
    vote,
    selectVote,
  });
  const { address } = useAccountDetails();
  const { delegatorAddress } = useDelegationContext();
  const { signingKeys } = useWalletContext();
  const hasSigningKey = !!address && !!signingKeys[address];
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
    isGovernance,
    timeAsDate,
    canReveal,
    rollCount,
    assertionChildChainId,
    assertionId,
  } = vote;
  const isMultipleValuesVote = decodedIdentifier === "MULTIPLE_VALUES";
  const dropdownOptions = isMultipleValuesVote
    ? multipleInputProps.dropdownOptions
    : options;
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const Icon = getVoteIcon();
  const isRolled = rollCount > 0;
  const existingVote = getDecryptedVoteAsFormattedString();
  const { data: claim } = useAssertionClaim(assertionChildChainId, assertionId);
  const {
    decryptedVotesIsLoading,
    activeVotesIsLoading,
    upcomingVotesIsLoading,
  } = useVotesContext();
  const { delegationStatus, isLoading: delegationDataLoading } =
    useDelegationContext();
  const isDelegate = delegationStatus === "delegate";
  const isDelegator = delegationStatus === "delegator";
  const isLoading =
    decryptedVotesIsLoading ||
    activeVotesIsLoading ||
    upcomingVotesIsLoading ||
    delegationDataLoading;

  const style = {
    "--border-color": getBorderColor(),
    "--dot-color": getDotColor(),
    "--cell-padding": "1.5vw",
    "--title-icon-size": "40px",
  } as CSSProperties;

  const titleOrClaim = removeMarkdown(
    claim ? getClaimTitle(decodeHexString(claim)) : title
  );
  const titleText =
    titleOrClaim.length > 100
      ? `${titleOrClaim.slice(0, 100)}...`
      : titleOrClaim;

  useEffect(() => {
    // if options exist but the existing decrypted vote is not one from the list,
    // then we must be using a custom input
    const decryptedVote = getDecryptedVoteAsFormattedString();
    if (decryptedVote && !findVoteInOptionsDetectEarlyVote(decryptedVote)) {
      if (!isMultipleValuesVote) {
        setIsCustomInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decryptedVote]);

  useEffect(() => {
    // Function returns true if the input exist and has changed from our committed value, false otherwise
    function isDirtyCheck(): boolean {
      if (phase !== "commit") return false;
      if (!existingVote) return false;
      // this happens if you clear the vote inputs, selected vote normally
      // would be "" if editing. dirty = false if we clear inputs.
      if (selectedVote === undefined) return false;
      return selectedVote !== existingVote;
    }
    const dirty = isDirtyCheck();
    if (setDirty && dirty !== isDirty) setDirty(dirty);
  }, [selectedVote, setDirty, isDirty, existingVote, phase]);

  function onSelectVote(option: DropdownItemT) {
    if (isMultipleValuesVote) {
      setIsCustomInput(false);
      multipleInputProps.onDropdownChange(option);
    } else if (option.value === "custom") {
      selectVote?.("");
      setIsCustomInput(true);
    } else {
      selectVote?.(option.value.toString());
    }
  }

  function exitCustomInput() {
    clearVote?.();
    setIsCustomInput(false);
  }

  function getDecryptedVoteAsFormattedString() {
    return decryptedVote?.price !== undefined
      ? formatVoteStringWithPrecision(decryptedVote.price, decodedIdentifier)
      : undefined;
  }

  function getDecryptedVoteAsString() {
    return getDecryptedVoteAsFormattedString();
  }

  function showVoteInput() {
    return activityStatus === "active" && phase === "commit";
  }

  function showYourVote() {
    return (
      (activityStatus === "active" && phase === "reveal") ||
      activityStatus === "past"
    );
  }

  function showCorrectVote() {
    return activityStatus === "past" && correctVote !== undefined;
  }

  function showVoteStatus() {
    return activityStatus === "active";
  }

  function getExistingOrSelectedVoteFromOptions() {
    return dropdownOptions?.find((option) => {
      const existingVote = getDecryptedVoteAsFormattedString();

      // prefer showing the selected vote if it exists
      if (selectedVote !== undefined) {
        return option.value === selectedVote;
      }

      if (existingVote !== undefined) {
        return option.value === existingVote;
      }
    });
  }

  const selectedDropdownOption = isMultipleValuesVote
    ? multipleInputProps.selectedDropdownOption
    : getExistingOrSelectedVoteFromOptions();

  function getYourVote() {
    // Check if wallet is connected
    if (!address && !delegatorAddress) {
      return "-";
    }

    // Check if we're loading user vote data
    if ("isLoadingUserVote" in vote && vote.isLoadingUserVote) {
      return undefined; // This will trigger the loading skeleton
    }
    if (isMultipleValuesVote && multipleInputProps.committedVote) {
      return multipleInputProps.getVoteForDisplay();
    }
    if (!decryptedVote && isCommitted) {
      return "Unknown";
    }
    if (!decryptedVote) return "Did not vote";
    return (
      findVoteInOptionsDetectEarlyVote(getDecryptedVoteAsFormattedString())
        ?.label ??
      formatVoteStringWithPrecision(
        decryptedVote?.price?.toString(),
        decodedIdentifier
      )
    );
  }

  function getCorrectVote() {
    if (correctVote === undefined || correctVote === null) return;
    if (isMultipleValuesVote) {
      return multipleInputProps.getCorrectVote();
    }
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

  function getCommittedOrRevealed() {
    if (phase === "commit") {
      if (!hasSigningKey) return "Requires signature";
      if (isCommitted && !decryptedVote) {
        if (isDelegator) {
          return "Committed by Delegate";
        } else if (isDelegate) {
          return "Committed by Delegator";
        } else {
          return "Decrypt Error";
        }
      }
      return isCommitted ? "Committed" : "Not committed";
    } else {
      if (!isCommitted) return "Not committed";
      if (!hasSigningKey) return "Requires signature";
      if (!decryptedVote || !canReveal) {
        if (isDelegator) {
          if (isRevealed) {
            return "Delegate revealed";
          } else {
            return "Delegate must reveal";
          }
        } else if (isDelegate) {
          if (isRevealed) {
            return "Delegator revealed";
          } else {
            return "Delegator must reveal";
          }
        } else {
          return "Unable to reveal";
        }
      }
      return isRevealed ? "Revealed" : "Not revealed";
    }
  }

  function getVoteIcon() {
    if (origin === "Across") return Across;
    if (origin === "Infinite Games") return InfiniteGames;
    if (origin === "OSnap") return OSnap;
    if (origin === "Polymarket") return Polymarket;
    if (origin === "Predict.Fun") return PredictFunIcon;
    if (origin === "Probable") return Probable;
    if (origin === "UMA" && isGovernance) return UMAGovernance;
    return UMA;
  }

  function getDotColor() {
    if (phase === "commit") {
      return isCommitted ? green : red500;
    } else {
      return isRevealed ? green : red500;
    }
  }

  function getBorderColor() {
    if (activityStatus === "past" || phase === "reveal") return grey100;
    return "transparent";
  }

  function getRelevantTransactionLink() {
    if (phase === "commit") {
      return commitHash ? (
        <Link
          className="underline hover:text-black-opacity-50"
          href={config.makeTransactionHashLink(commitHash)}
          target="_blank"
        >
          {getCommittedOrRevealed()}
        </Link>
      ) : (
        getCommittedOrRevealed()
      );
    }
    return revealHash ? (
      <Link
        href={config.makeTransactionHashLink(revealHash)}
        className="underline hover:text-black-opacity-50"
        target="_blank"
      >
        {getCommittedOrRevealed()}
      </Link>
    ) : (
      getCommittedOrRevealed()
    );
  }

  return {
    style,
    Icon,
    titleText,
    isRolled,
    origin,
    isV1,
    rollCount,
    resolvedPriceRequestIndex,
    timeAsDate,
    showVoteInput,
    selectVote,
    options,
    dropdownOptions,
    getExistingOrSelectedVoteFromOptions,
    onSelectVote,
    selectedVote,
    getDecryptedVoteAsString,
    isCustomInput,
    exitCustomInput,
    maxDecimals,
    showYourVote,
    getYourVote,
    showCorrectVote,
    getCorrectVote,
    showVoteStatus,
    isLoading,
    getDotColor,
    getRelevantTransactionLink,
    isDirty,
    moreDetailsAction,
    multipleInputProps,
    selectedDropdownOption,
    // Reveal selection props
    phase,
    isSelectedForReveal,
    toggleRevealSelection,
    canBeRevealed,
  };
}
