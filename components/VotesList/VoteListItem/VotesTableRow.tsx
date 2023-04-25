import { Button } from "components";
import { grey100 } from "constant";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteInput } from "./VoteInput";
import { VoteStatus } from "./VoteStatus";
import { VoteText } from "./VoteText";
import { VoteTitle } from "./VoteTitle";
import { VoteListItemProps, useVoteListItem } from "./useVoteListItem";

export function VotesTableRow(listItemProps: VoteListItemProps) {
  const props = useVoteListItem(listItemProps);
  const {
    isPast,
    isReveal,
    showVoteInput,
    showYourVote,
    showCorrectVote,
    showVoteStatus,
    formattedCorrectVote,
    formattedUserVote,
    onMoreDetails,
  } = props;

  const borderColor = isPast || isReveal ? grey100 : "transparent";

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
          <VoteText voteText={formattedUserVote} />
        </UserVoteCell>
      )}
      {showCorrectVote && (
        <CorrectVoteCell>
          <VoteText voteText={formattedCorrectVote} />
        </CorrectVoteCell>
      )}
      {showVoteStatus && (
        <VoteStatusCell>
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

const Wrapper = styled.tr`
  --cell-padding: 1.5vw;
  --title-icon-size: 40px;
  background: var(--white);
  height: 80px;
  border-radius: 5px;
`;

const VoteTitleCell = styled.td`
  width: var(--title-cell-width);
  padding-left: var(--cell-padding);
  padding-right: var(--cell-padding);
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const VoteInputCell = styled.td`
  width: var(--input-cell-width);
  padding-right: var(--cell-padding);
`;

const VoteOutputCell = styled.td`
  width: var(--output-cell-width);
  padding-right: var(--cell-padding);
  font: var(--text-md);
`;

const VoteStatusCell = styled.td`
  width: var(--status-cell-width);
  padding-right: var(--cell-padding);
  font: var(--text-md);
`;

const MoreDetailsCell = styled.td`
  width: var(--more-details-cell-width);
  padding-right: var(--cell-padding);
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const UserVoteCell = styled(VoteOutputCell)`
  white-space: nowrap;
`;

const CorrectVoteCell = styled(VoteOutputCell)`
  white-space: nowrap;
`;

const MoreDetails = styled.div`
  width: fit-content;
  margin-left: auto;
`;
