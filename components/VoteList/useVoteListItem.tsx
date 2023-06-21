import { green, grey100, isEarlyVote, red500, tabletMax } from "constant";
import {
  decodeHexString,
  formatVoteStringWithPrecision,
  getPrecisionForIdentifier,
} from "helpers";
import { config } from "helpers/config";
import {
  useAccountDetails,
  useAssertionClaim,
  useDelegationContext,
  useVotesContext,
  useWalletContext,
  useWindowSize,
} from "hooks";
import NextLink from "next/link";
import Across from "public/assets/icons/across.svg";
import OSnap from "public/assets/icons/osnap.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import UMAGovernance from "public/assets/icons/uma-governance.svg";
import UMA from "public/assets/icons/uma.svg";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DropdownItemT } from "types";
import { VoteListItemProps } from "./VoteTableRow";

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
}: VoteListItemProps) {
  const { width } = useWindowSize();
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const { address } = useAccountDetails();
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
  const maxDecimals = getPrecisionForIdentifier(decodedIdentifier);
  const Icon = getVoteIcon();
  const isTabletAndUnder = width && width <= tabletMax;
  const isRolled = rollCount > 0;
  const wrapperRef = useRef<HTMLTableRowElement>(null);
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

  useEffect(() => {
    // if options exist but the existing decrypted vote is not one from the list,
    // then we must be using a custom input
    const decryptedVote = getDecryptedVoteAsFormattedString();
    if (decryptedVote && !findVoteInOptionsDetectEarlyVote(decryptedVote)) {
      setIsCustomInput(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decryptedVote]);

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperWidth(wrapperRef.current.offsetWidth);
    }
  }, [width]);

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
    if (option.value === "custom") {
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
    return options?.find((option) => {
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

  function getYourVote() {
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
    if (origin === "Polymarket") return PolymarketIcon;
    if (origin === "OSnap") return OsnapIcon;
    if (origin === "Across") return AcrossIcon;
    if (origin === "UMA" && isGovernance) return UMAGovernanceIcon;
    return UMAIcon;
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

  function getCellWidths() {
    const baseCellWidths = {
      "--title-cell-width": `${0.5 * wrapperWidth}px`,
      "--input-cell-width": `${0.2 * wrapperWidth}px`,
      "--output-cell-width": "auto",
      "--status-cell-width": "auto",
      "--more-details-cell-width": "auto",
    };

    const commitCellWidths = baseCellWidths;

    const revealCellWidths = {
      ...baseCellWidths,
      "--title-cell-width": `${0.6 * wrapperWidth}px`,
    };

    const upcomingCellWidths = {
      ...baseCellWidths,
      "--title-cell-width": `${0.8 * wrapperWidth}px`,
    };

    const pastCellWidths = {
      ...baseCellWidths,
      "--title-cell-width": `${0.6 * wrapperWidth}px`,
    };

    if (activityStatus === "active") {
      if (phase === "commit") return commitCellWidths;
      if (phase === "reveal") return revealCellWidths;
    }

    if (activityStatus === "upcoming") return upcomingCellWidths;

    if (activityStatus === "past") return pastCellWidths;

    return baseCellWidths;
  }

  function getRelevantTransactionLink(): ReactNode | string {
    if (phase === "commit") {
      return commitHash ? (
        <Link href={config.makeTransactionHashLink(commitHash)} target="_blank">
          {getCommittedOrRevealed()}
        </Link>
      ) : (
        getCommittedOrRevealed()
      );
    }
    return revealHash ? (
      <Link href={config.makeTransactionHashLink(revealHash)} target="_blank">
        {getCommittedOrRevealed()}
      </Link>
    ) : (
      getCommittedOrRevealed()
    );
  }

  const style = {
    "--border-color": getBorderColor(),
    "--dot-color": getDotColor(),
    "--cell-padding": "1.5vw",
    "--title-icon-size": "40px",
    ...getCellWidths(),
  } as CSSProperties;

  const titleOrClaim = claim ? decodeHexString(claim) : title;

  return {
    width,
    isTabletAndUnder,
    style,
    wrapperRef,
    Icon,
    titleOrClaim,
    isRolled,
    origin,
    isV1,
    rollCount,
    resolvedPriceRequestIndex,
    timeAsDate,
    showVoteInput,
    selectVote,
    options,
    isCustomInput,
    getExistingOrSelectedVoteFromOptions,
    onSelectVote,
    selectedVote,
    getDecryptedVoteAsString,
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
  };
}

const Link = styled(NextLink)`
  font: var(--text-md);
  color: var(--black);
  text-decoration: underline;
  &:hover {
    color: var(--black-opacity-50);
  }
`;

const UMAIcon = styled(UMA)``;

const UMAGovernanceIcon = styled(UMAGovernance)``;

const AcrossIcon = styled(Across)``;

const PolymarketIcon = styled(Polymarket)``;

const OsnapIcon = styled(OSnap)``;
