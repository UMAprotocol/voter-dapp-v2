import {
  Button,
  Dropdown,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { green, grey100, red500, tabletAndUnder, tabletMax } from "constant";
import { config } from "helpers/config";
import { useUserContext, useWindowSize } from "hooks";
import NextLink from "next/link";
import Across from "public/assets/icons/across.svg";
import Dot from "public/assets/icons/dot.svg";
import OSnap from "public/assets/icons/osnap.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import Rolled from "public/assets/icons/rolled.svg";
import UMAGovernance from "public/assets/icons/uma-governance.svg";
import UMA from "public/assets/icons/uma.svg";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { VoteListItemProps, useVoteListItem } from "./useVoteListItem";
export function VoteListItem(delegatedProps: VoteListItemProps) {
  const { width } = useWindowSize();
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const { hasSigningKey } = useUserContext();
  const props = useVoteListItem(delegatedProps);
  const {
    titleOrClaim,
    origin,
    isUpcoming,
    isActive,
    isPast,
    isCommit,
    isCommitted,
    isReveal,
    isRevealed,
    isDelegator,
    isDelegate,
    isRolled,
    isV1,
    isCustomInput,
    isDirty,
    isFetching,
    isGovernance,
    showVoteInput,
    showYourVote,
    showCorrectVote,
    showVoteStatus,
    commitHash,
    revealHash,
    canReveal,
    resolvedPriceRequestIndex,
    decryptedVote,
    decryptedVoteAsFormattedString,
    options,
    selectedVote,
    existingOrSelectedVote,
    formattedDate,
    formattedCorrectVote,
    formattedUserVote,
    rollCount,
    maxDecimals,
    onMoreDetails,
    onSelectVoteInDropdown,
    onSelectVoteInTextInput,
    exitCustomInput,
  } = props;

  const Icon = getVoteIcon();
  const isTabletAndUnder = width && width <= tabletMax;
  const wrapperRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      setWrapperWidth(wrapperRef.current.offsetWidth);
    }
  }, [width]);

  function getCommittedOrRevealed() {
    if (isCommit) {
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
    if (isCommit) {
      return isCommitted ? green : red500;
    } else {
      return isRevealed ? green : red500;
    }
  }

  function getBorderColor() {
    if (isPast || isReveal) return grey100;
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

    if (isActive) {
      if (isCommit) return commitCellWidths;
      if (isReveal) return revealCellWidths;
    }

    if (isUpcoming) return upcomingCellWidths;

    if (isPast) return pastCellWidths;

    return baseCellWidths;
  }

  function getRelevantTransactionLink(): ReactNode | string {
    if (isCommit) {
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

  if (!width) return null;

  return (
    <Wrapper
      as={isTabletAndUnder ? "div" : "tr"}
      style={style}
      ref={wrapperRef}
    >
      <VoteTitleCell as={isTabletAndUnder ? "div" : "td"}>
        <VoteTitleWrapper>
          <VoteIconWrapper>
            <Icon />
          </VoteIconWrapper>
          <VoteDetailsWrapper>
            <VoteTitle>{titleOrClaim}</VoteTitle>
            <VoteDetailsInnerWrapper>
              {isRolled && !isV1 ? (
                <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
                  <RolledWrapper>
                    <RolledIconWrapper>
                      <RolledIcon />
                    </RolledIconWrapper>
                    <RolledLink
                      href="https://docs.umaproject.org/protocol-overview/dvm-2.0#rolled-votes"
                      target="_blank"
                    >
                      Roll #{rollCount}
                    </RolledLink>
                  </RolledWrapper>
                </Tooltip>
              ) : null}
              <VoteOrigin>
                {origin}{" "}
                {!isV1 &&
                  resolvedPriceRequestIndex &&
                  `| Vote #${resolvedPriceRequestIndex}`}{" "}
                | {formattedDate}
              </VoteOrigin>
            </VoteDetailsInnerWrapper>
          </VoteDetailsWrapper>
        </VoteTitleWrapper>
      </VoteTitleCell>
      {showVoteInput ? (
        <VoteInputCell as={isTabletAndUnder ? "div" : "td"}>
          {options && !isCustomInput ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={existingOrSelectedVote}
              onSelect={onSelectVoteInDropdown}
            />
          ) : (
            <TextInput
              value={selectedVote ?? decryptedVoteAsFormattedString ?? ""}
              onInput={onSelectVoteInTextInput}
              onClear={isCustomInput ? exitCustomInput : undefined}
              maxDecimals={maxDecimals}
              type="number"
            />
          )}
        </VoteInputCell>
      ) : null}
      {showYourVote ? (
        <YourVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Your vote</VoteLabel>{" "}
          <VoteText voteText={formattedUserVote} />
        </YourVote>
      ) : null}
      {showCorrectVote ? (
        <CorrectVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Correct vote</VoteLabel>{" "}
          <VoteText voteText={formattedCorrectVote} />
        </CorrectVote>
      ) : null}
      {showVoteStatus ? (
        <VoteStatusCell as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Vote status</VoteLabel>
          <VoteStatus>
            {isFetching ? (
              <LoadingSkeleton width="8vw" />
            ) : (
              <>
                <DotIcon
                  style={
                    {
                      "--dot-color": getDotColor(),
                    } as CSSProperties
                  }
                />{" "}
                {getRelevantTransactionLink()}
                {isDirty ? "*" : ""}
              </>
            )}
          </VoteStatus>
        </VoteStatusCell>
      ) : null}
      <MoreDetailsCell as={isTabletAndUnder ? "div" : "td"}>
        <MoreDetails>
          <Button label="More details" onClick={onMoreDetails} />
        </MoreDetails>
      </MoreDetailsCell>
    </Wrapper>
  );
}

function VoteText({ voteText }: { voteText: string | undefined }) {
  if (!voteText) return <LoadingSkeleton width="8vw" />;

  const maxVoteTextLength = 15;
  if (voteText.length > maxVoteTextLength) {
    return (
      <Tooltip label={voteText}>
        <VoteTextWrapper>
          {voteText.slice(0, maxVoteTextLength)}...
        </VoteTextWrapper>
      </Tooltip>
    );
  }

  return <span>{voteText}</span>;
}

const VoteTextWrapper = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

const Wrapper = styled.tr`
  background: var(--white);
  height: 80px;
  border-radius: 5px;

  @media ${tabletAndUnder} {
    height: auto;
    display: grid;
    gap: 12px;
    align-items: left;
    padding: 15px;
  }
`;

const VoteTitleCell = styled.td`
  width: var(--title-cell-width);
  padding-left: var(--cell-padding);
  padding-right: var(--cell-padding);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;

  @media ${tabletAndUnder} {
    width: 100%;
    padding: 0;
  }
`;

const VoteInputCell = styled.td`
  width: var(--input-cell-width);
  padding-right: var(--cell-padding);

  @media ${tabletAndUnder} {
    padding: 0;
    min-width: unset;
  }
`;

const VoteOutputCell = styled.td`
  width: var(--output-cell-width);
  padding-right: var(--cell-padding);
  font: var(--text-md);

  @media ${tabletAndUnder} {
    display: flex;
    justify-content: space-between;
  }
`;

const VoteStatusCell = styled.td`
  width: var(--status-cell-width);
  padding-right: var(--cell-padding);

  font: var(--text-md);

  @media ${tabletAndUnder} {
    display: flex;
    justify-content: space-between;
  }
`;

const MoreDetailsCell = styled.td`
  width: var(--more-details-cell-width);
  padding-right: var(--cell-padding);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;

  @media ${tabletAndUnder} {
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
  }
`;

const VoteTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--cell-padding);

  @media ${tabletAndUnder} {
    gap: unset;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border-color);
  }
`;

const VoteTitle = styled.h3`
  font: var(--header-sm);
  max-width: calc(
    var(--title-cell-width) - var(--title-icon-size) - 3 * var(--cell-padding)
  );
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${tabletAndUnder} {
    max-width: unset;
    white-space: unset;
    overflow: unset;
    text-overflow: unset;
    margin-bottom: 5px;
  }
`;

const VoteDetailsWrapper = styled.div``;

const VoteDetailsInnerWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const VoteIconWrapper = styled.div`
  width: var(--title-icon-size);
  height: var(--title-icon-size);

  @media ${tabletAndUnder} {
    display: none;
  }
`;

const VoteOrigin = styled.h4`
  font: var(--text-xs);
  color: var(--black-opacity-50);
`;

const YourVote = styled(VoteOutputCell)`
  white-space: nowrap;
`;

const CorrectVote = styled(VoteOutputCell)`
  white-space: nowrap;

  @media ${tabletAndUnder} {
    padding-left: 0;
  }
`;

const VoteLabel = styled.span`
  display: none;

  @media ${tabletAndUnder} {
    display: inline;
  }
`;

const VoteStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: max-content;
  white-space: nowrap;

  @media ${tabletAndUnder} {
    margin-left: 0;
  }
`;

const MoreDetails = styled.div`
  width: fit-content;
  margin-left: auto;

  @media ${tabletAndUnder} {
    margin-left: unset;
    margin-right: auto;
  }
`;

const UMAIcon = styled(UMA)``;

const UMAGovernanceIcon = styled(UMAGovernance)``;

const AcrossIcon = styled(Across)``;

const PolymarketIcon = styled(Polymarket)``;

const OsnapIcon = styled(OSnap)``;

const DotIcon = styled(Dot)`
  circle {
    fill: var(--dot-color);
  }
`;

const RolledWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
`;

const RolledIconWrapper = styled.div`
  width: 7px;
  height: 7px;
`;

const RolledIcon = styled(Rolled)``;

const RolledLink = styled(NextLink)`
  font: var(--text-sm);
  color: var(--red-500);
  text-decoration: underline;
`;

const Link = styled(NextLink)`
  font: var(--text-md);
  color: var(--black);
  text-decoration: underline;
  &:hover {
    color: var(--black-opacity-50);
  }
`;
