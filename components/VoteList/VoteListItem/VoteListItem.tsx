import { Button } from "components";
import { grey100 } from "constant";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteInput } from "./VoteInput";
import { VoteStatus } from "./VoteStatus";
import { VoteText } from "./VoteText";
import { VoteTitle } from "./VoteTitle";
import { VoteListItemProps, useVoteListItem } from "./useVoteListItem";

export function VoteListItem(listItemProps: VoteListItemProps) {
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
      <VoteTitleWrapper>
        <VoteTitle {...props} />
      </VoteTitleWrapper>
      {showVoteInput && (
        <VoteInputWrapper>
          <VoteInput {...props} />
        </VoteInputWrapper>
      )}
      {showYourVote && (
        <UserVoteWrapper>
          <VoteLabel>Your vote</VoteLabel>
          <VoteText voteText={formattedUserVote} />
        </UserVoteWrapper>
      )}
      {showCorrectVote && (
        <CorrectVoteWrapper>
          <VoteLabel>Correct vote</VoteLabel>
          <VoteText voteText={formattedCorrectVote} />
        </CorrectVoteWrapper>
      )}
      {showVoteStatus && (
        <VoteStatusWrapper>
          <VoteLabel>Vote status</VoteLabel> <VoteStatus {...props} />
        </VoteStatusWrapper>
      )}
      <MoreDetailsWrapper>
        <MoreDetailsButtonWrapper>
          <Button label="More details" onClick={onMoreDetails} />
        </MoreDetailsButtonWrapper>
      </MoreDetailsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  --cell-padding: 1.5vw;
  --title-icon-size: 40px;
  background: var(--white);
  border-radius: 5px;
  height: auto;
  display: grid;
  gap: 12px;
  align-items: left;
  padding: 15px;
`;

const VoteTitleWrapper = styled.div`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  width: 100%;
  padding: 0;
`;

const VoteInputWrapper = styled.div`
  padding: 0;
`;

const VoteOutputWrapper = styled.div`
  font: var(--text-md);
  display: flex;
  justify-content: space-between;
`;

const VoteStatusWrapper = styled.div`
  font: var(--text-md);
  display: flex;
  justify-content: space-between;
`;

const MoreDetailsWrapper = styled.div`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
`;

const UserVoteWrapper = styled(VoteOutputWrapper)`
  white-space: nowrap;
`;

const CorrectVoteWrapper = styled(VoteOutputWrapper)`
  white-space: nowrap;
  padding-left: 0;
`;

const VoteLabel = styled.span`
  display: inline;
`;

const MoreDetailsButtonWrapper = styled.div`
  width: fit-content;
  margin-right: auto;
`;
