import { Button, VoteList, VoteListItem, VoteTableHeadings } from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { CSSProperties } from "react";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  Title,
  VoteListWrapper,
} from "./style";

export function PastVotes() {
  const { pastVoteList, getUserDependentIsFetching } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();

  return (
    <>
      <Title>Recent past votes:</Title>
      <VoteListWrapper
        style={
          {
            "--margin-top": "0px",
          } as CSSProperties
        }
      >
        <VoteList
          headings={<VoteTableHeadings activityStatus="past" />}
          rows={pastVoteList.slice(0, 5).map((vote) => (
            <VoteListItem
              vote={vote}
              phase={phase}
              activityStatus="past"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              isFetching={getUserDependentIsFetching()}
            />
          ))}
        />
      </VoteListWrapper>
      <ButtonOuterWrapper>
        <ButtonInnerWrapper>
          <Button label="See all" href="/past-votes" variant="primary" />
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
    </>
  );
}
