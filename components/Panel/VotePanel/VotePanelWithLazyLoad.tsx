import { LoadingSpinner } from "components";
import { usePastVoteDetails, useVotesContext } from "hooks";
import { useMemo } from "react";
import styled from "styled-components";
import { VoteT } from "types";
import { VotePanel } from "./VotePanel";

interface Props {
  content: VoteT;
}

export function VotePanelWithLazyLoad({ content }: Props) {
  const { isPast } = useVotesContext();
  const needsDetailedData =
    isPast && content.participation?.totalTokensVotedWith === 0;

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

  if (needsDetailedData && isLoading) {
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
