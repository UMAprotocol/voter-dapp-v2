import { LoadingSpinner } from "components";
import {
  usePastVoteDetails,
  useUserVotingAndStakingDetails,
  useAccountDetails,
  useDelegationContext,
} from "hooks";
import { useMemo, useRef } from "react";
import styled from "styled-components";
import { VoteT } from "types";
import { VotePanel } from "./VotePanel";

interface Props {
  content: VoteT;
}

export function VotePanelWithLazyLoad({ content }: Props) {
  const { address: userAddress } = useAccountDetails();
  const { isDelegate, delegatorAddress } = useDelegationContext();
  const userOrDelegatorAddress = isDelegate ? delegatorAddress : userAddress;
  const { data: votingAndStakingDetails } = useUserVotingAndStakingDetails(
    userOrDelegatorAddress
  );

  // Check if this user has vote history for this specific vote
  const userHasVoteHistory =
    votingAndStakingDetails?.voteHistoryByKey?.[content.uniqueKey]?.voted;

  // Check if revealedVoteByAddress is empty (which means we're using lightweight data)
  const hasEmptyRevealedVotes =
    Object.keys(content.revealedVoteByAddress || {}).length === 0;

  const needsDetailedData =
    (content.participation?.totalTokensVotedWith === 0 ||
      (userHasVoteHistory && hasEmptyRevealedVotes)) &&
    content.resolvedPriceRequestIndex !== undefined;

  const {
    data: detailedVote,
    isLoading,
    isError,
  } = usePastVoteDetails(
    needsDetailedData && content.resolvedPriceRequestIndex
      ? Number(content.resolvedPriceRequestIndex)
      : undefined
  );

  const voteToShow = useMemo(() => {
    if (needsDetailedData && detailedVote) {
      // Merge the detailed data with the existing vote data
      return {
        ...content,
        participation: detailedVote.participation ?? content.participation,
        results: detailedVote.results ?? content.results,
        revealedVoteByAddress:
          detailedVote.revealedVoteByAddress ?? content.revealedVoteByAddress,
      };
    }
    return content;
  }, [content, detailedVote, needsDetailedData]);

  // the vote most recently rendered by this panel — when the panel's content
  // is swapped for the same vote (e.g. a deeplink's provisional vote being
  // upgraded to the canonical list vote), keep showing it while the new
  // content's details load instead of flashing a spinner over a full panel
  const lastShownRef = useRef<VoteT>();

  if (needsDetailedData && isLoading) {
    if (lastShownRef.current?.uniqueKey === content.uniqueKey) {
      return <VotePanel content={lastShownRef.current} />;
    }
    return (
      <LoadingWrapper>
        <LoadingSpinner size={40} variant="black" />
        <LoadingText>Loading vote details...</LoadingText>
      </LoadingWrapper>
    );
  }

  if (needsDetailedData && isError) {
    return (
      <ErrorWrapper>
        <ErrorText>
          Failed to load vote details. Please try again later.
        </ErrorText>
      </ErrorWrapper>
    );
  }

  lastShownRef.current = voteToShow;
  return <VotePanel content={voteToShow} />;
}

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 20px;
`;

const LoadingText = styled.div`
  font: var(--text-md);
  color: var(--grey-800);
`;

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
`;

const ErrorText = styled.div`
  font: var(--text-md);
  color: var(--red-600);
`;
