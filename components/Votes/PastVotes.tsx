import {
  Button,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
} from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { CSSProperties } from "react";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  Title,
  VotesListWrapper,
} from "./style";

export function PastVotes() {
  const { pastVotesList, getUserDependentIsFetching } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();

  return (
    <>
      <Title>Recent past votes:</Title>
      <VotesListWrapper
        style={
          {
            "--margin-top": "0px",
          } as CSSProperties
        }
      >
        <VotesList
          headings={<VotesTableHeadings activityStatus="past" />}
          rows={pastVotesList.slice(0, 5).map((vote) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              activityStatus="past"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              isFetching={getUserDependentIsFetching()}
            />
          ))}
        />
      </VotesListWrapper>
      <ButtonOuterWrapper>
        <ButtonInnerWrapper>
          <Button label="See all" href="/past-votes" variant="primary" />
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
    </>
  );
}
