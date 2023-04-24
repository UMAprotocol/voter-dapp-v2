import {
  Button,
  Dropdown,
  LoadingSkeleton,
  TextInput,
  Tooltip,
} from "components";
import { getProjectIcon, green, red500, tabletAndUnder } from "constant";
import { config } from "helpers/config";
import NextLink from "next/link";
import Dot from "public/assets/icons/dot.svg";
import Rolled from "public/assets/icons/rolled.svg";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteOriginT } from "types";
import {
  VoteListItemHookResult,
  VoteListItemProps,
  useVoteListItem,
} from "./useVoteListItem";

export function VotesTableRow(listItemProps: VoteListItemProps) {
  const props = useVoteListItem(listItemProps);
  const {
    borderColor,
    showVoteInput,
    showYourVote,
    showCorrectVote,
    showVoteStatus,
    formattedCorrectVote,
    formattedUserVote,
    onMoreDetails,
  } = props;

  return (
    <Wrapper
      style={
        {
          "--border-color": borderColor,
        } as CSSProperties
      }
    >
      <VoteTitleCell>
        <VoteTitle {...props} />
      </VoteTitleCell>
      {showVoteInput && (
        <VoteInputCell>
          <VoteInput {...props} />
        </VoteInputCell>
      )}
      {showYourVote && (
        <UserVoteCell>
          <VoteLabel>Your vote</VoteLabel>{" "}
          <VoteText voteText={formattedUserVote} />
        </UserVoteCell>
      )}
      {showCorrectVote && (
        <CorrectVoteCell>
          <VoteLabel>Correct vote</VoteLabel>{" "}
          <VoteText voteText={formattedCorrectVote} />
        </CorrectVoteCell>
      )}
      {showVoteStatus && (
        <VoteStatusCell>
          <VoteLabel>Vote status</VoteLabel>
          <VoteStatus {...props} />
        </VoteStatusCell>
      )}
      <MoreDetailsCell>
        <MoreDetails>
          <Button label="More details" onClick={onMoreDetails} />
        </MoreDetails>
      </MoreDetailsCell>
    </Wrapper>
  );
}

function VoteTitle({
  origin,
  title,
  showRolledVoteExplanation,
  voteNumber,
  formattedDate,
  rollCount,
}: VoteListItemHookResult) {
  return (
    <VoteTitleWrapper>
      <ProjectIcon origin={origin} />
      <VoteDetailsWrapper>
        <VoteTitleText>{title}</VoteTitleText>
        <VoteDetailsInnerWrapper>
          {showRolledVoteExplanation && (
            <RolledVoteExplanation rollCount={rollCount} />
          )}
          <VoteOrigin>
            {origin} {!!voteNumber && `| Vote #${voteNumber}`} | {formattedDate}
          </VoteOrigin>
        </VoteDetailsInnerWrapper>
      </VoteDetailsWrapper>
    </VoteTitleWrapper>
  );
}

function VoteInput({
  showDropdown,
  options,
  selectedVote,
  onSelectVoteInDropdown,
  onSelectVoteInTextInput,
  decryptedVoteAsFormattedString,
  existingOrSelectedVote,
  isCustomInput,
  exitCustomInput,
  maxDecimals,
}: VoteListItemHookResult) {
  return (
    <>
      {showDropdown ? (
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
    </>
  );
}

function RolledVoteExplanation({ rollCount }: { rollCount: number }) {
  return (
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
  );
}

function ProjectIcon({ origin }: { origin: VoteOriginT }) {
  const icon = getProjectIcon(origin);

  return <ProjectIconWrapper>{icon}</ProjectIconWrapper>;
}

function VoteStatus({
  phase,
  isCommitted,
  decryptedVote,
  delegationStatus,
  isRevealed,
  canReveal,
  commitHash,
  revealHash,
  isFetching,
  isDirty,
}: VoteListItemHookResult) {
  function getCommittedOrRevealed() {
    if (phase === "commit") {
      if (isCommitted && !decryptedVote) {
        if (delegationStatus === "delegator") {
          return "Committed by Delegate";
        } else if (delegationStatus === "delegate") {
          return "Committed by Delegator";
        } else {
          return "Decrypt Error";
        }
      }
      return isCommitted ? "Committed" : "Not committed";
    } else {
      if (!isCommitted) return "Not committed";
      if (!decryptedVote || !canReveal) {
        if (delegationStatus === "delegator") {
          if (isRevealed) {
            return "Delegate revealed";
          } else {
            return "Delegate must reveal";
          }
        } else if (delegationStatus === "delegate") {
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
  function getRelevantTransactionLink() {
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
  function getDotColor() {
    if (phase === "commit") {
      return isCommitted ? green : red500;
    } else {
      return isRevealed ? green : red500;
    }
  }

  if (isFetching) return <LoadingSkeleton width="8vw" />;

  return (
    <VoteStatusWrapper>
      <DotIcon
        style={
          {
            "--dot-color": getDotColor(),
          } as CSSProperties
        }
      />{" "}
      {getRelevantTransactionLink()}
      {isDirty ? "*" : ""}
    </VoteStatusWrapper>
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
  --cell-padding: 1.5vw;
  --title-icon-size: 40px;
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

const VoteTitleText = styled.h3`
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

const ProjectIconWrapper = styled.div`
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

const UserVoteCell = styled(VoteOutputCell)`
  white-space: nowrap;
`;

const CorrectVoteCell = styled(VoteOutputCell)`
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

const VoteStatusWrapper = styled.div`
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

const Link = styled(NextLink)`
  font: var(--text-md);
  color: var(--black);
  text-decoration: underline;
  &:hover {
    color: var(--black-opacity-50);
  }
`;
