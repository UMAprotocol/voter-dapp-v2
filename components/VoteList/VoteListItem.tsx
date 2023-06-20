import {
  Button,
  Dropdown,
  Loader,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { tabletAndUnder } from "constant";
import { format } from "date-fns";
import { enCA } from "date-fns/locale";
import NextLink from "next/link";
import Dot from "public/assets/icons/dot.svg";
import Rolled from "public/assets/icons/rolled.svg";
import { CSSProperties } from "react";
import styled from "styled-components";
import { ActivityStatusT, VotePhaseT, VoteT } from "types";
import { useVoteListItem } from "./useVoteListItem";

export interface VoteListItemProps {
  vote: VoteT;
  phase: VotePhaseT;
  selectedVote?: string | undefined;
  selectVote?: (value: string | undefined) => void;
  clearVote?: () => void;
  activityStatus: ActivityStatusT | undefined;
  moreDetailsAction: () => void;
  setDirty?: (dirty: boolean) => void;
  isDirty?: boolean;
}
export function VoteListItem(props: VoteListItemProps) {
  const {
    width,
    isTabletAndUnder,
    style,
    wrapperRef,
    Icon,
    titleOrClaim,
    isRolled,
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
  } = useVoteListItem(props);

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
                |{" "}
                {format(timeAsDate, "Pp", {
                  // en-CA is the only locale that uses the correct
                  // format for the date
                  // yyyy-mm-dd
                  locale: enCA,
                })}
              </VoteOrigin>
            </VoteDetailsInnerWrapper>
          </VoteDetailsWrapper>
        </VoteTitleWrapper>
      </VoteTitleCell>
      {showVoteInput() && selectVote ? (
        <VoteInputCell as={isTabletAndUnder ? "div" : "td"}>
          {options && !isCustomInput ? (
            <Dropdown
              label="Choose answer"
              items={options}
              selected={getExistingOrSelectedVoteFromOptions()}
              onSelect={onSelectVote}
            />
          ) : (
            <TextInput
              value={selectedVote ?? getDecryptedVoteAsString() ?? ""}
              onInput={selectVote}
              onClear={isCustomInput ? exitCustomInput : undefined}
              maxDecimals={maxDecimals}
              type="number"
            />
          )}
        </VoteInputCell>
      ) : null}
      {showYourVote() ? (
        <YourVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Your vote</VoteLabel> <VoteText voteText={getYourVote()} />
        </YourVote>
      ) : null}
      {showCorrectVote() ? (
        <CorrectVote as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Correct vote</VoteLabel>{" "}
          <VoteText voteText={getCorrectVote()} />
        </CorrectVote>
      ) : null}
      {showVoteStatus() ? (
        <VoteStatusCell as={isTabletAndUnder ? "div" : "td"}>
          <VoteLabel>Vote status</VoteLabel>
          <VoteStatus>
            <Loader isLoading={isLoading} width="6vw">
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
            </Loader>
          </VoteStatus>
        </VoteStatusCell>
      ) : null}
      <MoreDetailsCell as={isTabletAndUnder ? "div" : "td"}>
        <MoreDetails>
          <Button label="More details" onClick={moreDetailsAction} />
        </MoreDetails>
      </MoreDetailsCell>
    </Wrapper>
  );
}

function VoteText({ voteText }: { voteText: string | undefined }) {
  if (voteText === undefined) return <LoadingSkeleton width="8vw" />;

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
