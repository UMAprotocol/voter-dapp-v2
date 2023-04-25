import { Tooltip } from "@reach/tooltip";
import { LoadingSkeleton } from "components/LoadingSkeleton/LoadingSkeleton";
import styled from "styled-components";

export function VoteText({ voteText }: { voteText: string | undefined }) {
  if (!voteText) return <LoadingSkeleton width="8vw" />;

  const maxVoteTextLength = 15;
  if (voteText.length > maxVoteTextLength) {
    return (
      <Tooltip label={voteText}>
        <VoteTextWrapper>
          {voteText.slice(0, maxVoteTextLength)}...
        </VoteTextWrapper>
      </Tooltip>
    );
  }

  return <span>{voteText}</span>;
}

const VoteTextWrapper = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;
