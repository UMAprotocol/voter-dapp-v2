import { Button, VoteList, VoteListItem, VoteTableHeadings } from "components";
import {
  useDelegationContext,
  usePanelContext,
  useVoteTimingContext,
  useVotesContext,
} from "hooks";
import { CSSProperties } from "react";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  Title,
  VotesTableWrapper,
} from "./style";

export function PastVotes() {
  const { pastVoteList, getUserDependentIsFetching } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { isDelegate, isDelegator } = useDelegationContext();

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
        <VoteList
          headings={<VoteTableHeadings activityStatus="past" />}
          rows={pastVoteList.slice(0, 5).map((vote) => (
            <VoteListItem
              vote={vote}
              phase={phase}
              activityStatus="past"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              isDelegate={isDelegate}
              isDelegator={isDelegator}
              isFetching={getUserDependentIsFetching()}
            />
          ))}
        />
      </VotesTableWrapper>
      <ButtonOuterWrapper>
        <ButtonInnerWrapper>
          <Button label="See all" href="/past-votes" variant="primary" />
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
    </>
  );
}
