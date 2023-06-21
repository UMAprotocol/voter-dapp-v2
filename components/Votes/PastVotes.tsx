import { Button, VoteList } from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { CSSProperties } from "react";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  Title,
  VotesTableWrapper,
} from "./style";

export function PastVotes() {
  const { pastVoteList = [] } = useVotesContext();
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();

  const data = pastVoteList.slice(0, 5).map((vote) => ({
    vote: vote,
    phase: phase,
    activityStatus: "past" as const,
    moreDetailsAction: () => openPanel("vote", vote),
  }));

  return (
    <>
      <Title>Recent past votes:</Title>
      <VotesTableWrapper
        style={
          {
            "--margin-top": "0px",
          } as CSSProperties
        }
      >
        <VoteList activityStatus="past" data={data} />
      </VotesTableWrapper>
      <ButtonOuterWrapper>
        <ButtonInnerWrapper>
          <Button label="See all" href="/past-votes" variant="primary" />
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
    </>
  );
}
