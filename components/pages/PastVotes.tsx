import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
  VoteListItem,
  VoteTableHeadings,
  usePagination,
} from "components";
import { usePanelContext, useVoteTimingContext, useVotesContext } from "hooks";
import { isUndefined } from "lodash";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function PastVotes() {
  const { pastVoteList } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    pastVoteList ?? []
  );
  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isUndefined(pastVoteList) ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              <VotesTableWrapper>
                <VoteList
                  headings={<VoteTableHeadings activityStatus="past" />}
                  rows={entriesToShow.map((vote) => (
                    <VoteListItem
                      phase={phase}
                      vote={vote}
                      selectedVote={undefined}
                      selectVote={() => null}
                      clearVote={() => null}
                      activityStatus="past"
                      moreDetailsAction={() => openPanel("vote", vote)}
                      key={vote.uniqueKey}
                    />
                  ))}
                />
              </VotesTableWrapper>
              {showPagination && (
                <PaginationWrapper>
                  <Pagination {...paginationProps} />
                </PaginationWrapper>
              )}
            </>
          )}
        </PageInnerWrapper>
      </PageOuterWrapper>
    </Layout>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: 35px;
`;

const PaginationWrapper = styled.div`
  margin-block: 30px;
`;
