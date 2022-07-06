import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import styled from "styled-components";
import { VoteT, VoteTimelineT } from "types/global";

interface Props {
  votes: VoteT[];
  voteTimeline: VoteTimelineT;
  moreDetailsAction: (vote: VoteT) => void;
}
export function Votes({ votes, voteTimeline, moreDetailsAction }: Props) {
  function commitVotes() {
    console.log("TODO Commit votes");
  }

  return (
    <Wrapper>
      <Title>Vote on active disputes</Title>
      <VoteTimeline {...voteTimeline} />
      <VotesWrapper>
        {votes.map((vote) => (
          <VoteBar vote={vote} key={vote.dispute.title} moreDetailsAction={moreDetailsAction} />
        ))}
      </VotesWrapper>
      <CommitVotesButtonWrapper>
        <Button label="Commit votes" onClick={commitVotes} />
      </CommitVotesButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Title = styled.h1``;

const VotesWrapper = styled.div``;

const CommitVotesButtonWrapper = styled.div``;
