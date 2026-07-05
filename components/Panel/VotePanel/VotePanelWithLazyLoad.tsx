import { LoadingSpinner } from "components";
import {
  usePanelContext,
  usePastVoteDetails,
  useUserVotingAndStakingDetails,
  useAccountDetails,
  useDelegationContext,
} from "hooks";
import { useMemo } from "react";
import styled from "styled-components";
import { VoteT } from "types";
import { VotePanel } from "./VotePanel";
import Close from "public/assets/icons/close.svg";

interface Props {
  content: VoteT;
}

export function VotePanelWithLazyLoad({ content }: Props) {
  const { closePanel } = usePanelContext();
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

  const fallbackCloseButton = (
    <FallbackCloseButton
      onClick={() => closePanel()}
      aria-label="Close panel"
    >
      <FallbackCloseIconWrapper>
        <FallbackCloseIcon />
      </FallbackCloseIconWrapper>
    </FallbackCloseButton>
  );

  if (needsDetailedData && isLoading) {
    return (
      <>
        {fallbackCloseButton}
        <LoadingWrapper>
          <LoadingSpinner size={40} variant="black" />
          <LoadingText>Loading vote details...</LoadingText>
        </LoadingWrapper>
      </>
    );
  }

  if (needsDetailedData && isError) {
    return (
      <>
        {fallbackCloseButton}
        <ErrorWrapper>
          <ErrorText>
            Failed to load vote details. Please try again later.
          </ErrorText>
        </ErrorWrapper>
      </>
    );
  }

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

const FallbackCloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  background: transparent;
`;

const FallbackCloseIcon = styled(Close)`
  path {
    fill: var(--black);
  }
`;

const FallbackCloseIconWrapper = styled.div`
  width: 15px;
  height: 15px;
`;
