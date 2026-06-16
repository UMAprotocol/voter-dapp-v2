import { Pagination, usePagination, VoteList } from "components";
import {
  usePanelContext,
  useVoteTimingContext,
  useVotesContext,
  useAccountDetails,
  useDelegationContext,
} from "hooks";
import { useUserPastVotes } from "hooks/queries/votes/useUserPastVotes";
import { CSSProperties, useMemo } from "react";
import { PaginationWrapper, Title, VotesTableWrapper } from "./style";
import { VoteT } from "types";

export function PastVotes() {
  const { pastVoteList = [] } = useVotesContext();
  const { openPanel } = usePanelContext();
  const { phase } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const { delegatorAddress } = useDelegationContext();
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(pastVoteList);

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
        vote: updatedVote,
        phase: phase,
        activityStatus: "past" as const,
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
      {showPagination && (
        <PaginationWrapper>
          <Pagination {...paginationProps} />
        </PaginationWrapper>
      )}
    </>
  );
}
