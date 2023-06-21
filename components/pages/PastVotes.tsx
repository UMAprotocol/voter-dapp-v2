import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
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

  const data = entriesToShow.map((vote) => ({
    activityStatus: "past" as const,
    vote,
    phase,
    moreDetailsAction: () => openPanel("vote", vote),
  }));

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
                <VoteList activityStatus="past" data={data} />
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
