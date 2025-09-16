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
import {
  usePanelContext,
  useVoteTimingContext,
  useVotesContext,
  useAccountDetails,
  useDelegationContext,
} from "hooks";
import { useUserPastVotes } from "hooks/queries/votes/useUserPastVotes";
import { isUndefined } from "lodash";
import { useMemo } from "react";
import styled from "styled-components";
import { LoadingSpinnerWrapper } from "./styles";
import { VoteT } from "types";

export function PastVotes() {
  const { pastVoteList, pastVotesIsLoading } = useVotesContext();
  const { phase } = useVoteTimingContext();
  const { openPanel } = usePanelContext();
  const { address } = useAccountDetails();
  const { delegatorAddress } = useDelegationContext();
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    pastVoteList ?? []
  );

  // Check if wallet is connected
  const isWalletConnected = !!(address || delegatorAddress);

  // Fetch user vote details for the current page
  const { data: userVoteDetails, isLoading: userVotesLoading } =
    useUserPastVotes(entriesToShow);

  const data = useMemo(() => {
    return entriesToShow.map((vote) => {
      // Merge the revealed vote data if available
      const revealedVoteByAddress =
        userVoteDetails?.[vote.uniqueKey] || vote.revealedVoteByAddress || {};

      // If we have user vote data, we need to update decryptedVote as well
      const updatedVote: VoteT & { isLoadingUserVote?: boolean } = {
        ...vote,
        revealedVoteByAddress,
      };

      // Add loading state for V2 votes that don't have vote data yet
      // Only show loading if wallet is connected
      if (
        !vote.isV1 &&
        userVotesLoading &&
        !userVoteDetails &&
        isWalletConnected
      ) {
        updatedVote.isLoadingUserVote = true;
      }

      if (userVoteDetails?.[vote.uniqueKey]) {
        // Find the user's vote in the revealedVoteByAddress
        const addresses = Object.keys(revealedVoteByAddress);
        const userVote = addresses
          .map((addr) => revealedVoteByAddress[addr])
          .find((v) => v);

        if (userVote && !vote.decryptedVote) {
          // Set decryptedVote if we found the user's vote
          updatedVote.decryptedVote = { price: userVote, salt: "" };
        }
      }

      return {
        activityStatus: "past" as const,
        vote: updatedVote,
        phase,
        moreDetailsAction: () => openPanel("vote", vote),
      };
    });
  }, [
    entriesToShow,
    userVoteDetails,
    phase,
    openPanel,
    isWalletConnected,
    userVotesLoading,
  ]);

  const isLoading = pastVotesIsLoading || isUndefined(pastVoteList);

  return (
    <Layout title="UMA | Past Votes">
      <Banner>Past Votes</Banner>
      <PageOuterWrapper>
        <PageInnerWrapper>
          {isLoading ? (
            <LoadingSpinnerWrapper>
              <LoadingSpinner size={40} variant="black" />
              <LoadingText>Loading past votes...</LoadingText>
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

const LoadingText = styled.div`
  margin-top: 20px;
  font: var(--text-md);
  color: var(--grey-800);
  text-align: center;
`;
