import {
  Button,
  Pagination,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
} from "components";
import { defaultResultsPerPage } from "constant";
import { getEntriesForPage } from "helpers";
import {
  usePaginationContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
} from "hooks";
import styled, { CSSProperties } from "styled-components";
import { VoteT } from "types";

export function PastVotes({ votes }: { votes: VoteT[] }) {
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();
  const {
    pageStates: {
      pastVotesComponent: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();
  const { getUserDependentIsFetching } = useVotesContext();
  const votesToShow = getEntriesForPage(pageNumber, resultsPerPage, votes);

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
        <VotesList
          headings={<VotesTableHeadings activityStatus="past" />}
          rows={votesToShow.map((vote) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              selectedVote={undefined}
              selectVote={() => null}
              activityStatus="past"
              moreDetailsAction={() => openPanel("vote", vote)}
              key={vote.uniqueKey}
              isFetching={getUserDependentIsFetching()}
            />
          ))}
        />
      </VotesTableWrapper>
      {votes.length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination
            paginateFor="pastVotesComponent"
            numberOfEntries={votes.length}
          />
        </PaginationWrapper>
      )}
      <ButtonInnerWrapper>
        <Button label="See all" href="/past-votes" variant="primary" />
      </ButtonInnerWrapper>
    </>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
  }
`;

const PaginationWrapper = styled.div`
  margin-block: 30px;
`;
