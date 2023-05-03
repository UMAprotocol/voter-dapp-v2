import {
  Banner,
  Layout,
  LoadingSpinner,
  PageInnerWrapper,
  PageOuterWrapper,
  Pagination,
  VoteList,
  usePagination,
  useVoteList,
} from "components";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";

export function PastVotes() {
  const voteListProps = useVoteList("past");
  const { voteList, isLoading } = voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);
  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
            </LoadingSpinnerWrapper>
          ) : (
            <>
              <VotesTableWrapper>
                <VoteList votesToShow={entriesToShow} {...voteListProps} />
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
