import { LoadingSkeleton } from "components/LoadingSkeleton/LoadingSkeleton";
import { green, red500, tabletAndUnder } from "constant";
import { config } from "helpers/config";
import NextLink from "next/link";
import Dot from "public/assets/icons/dot.svg";
import { CSSProperties } from "react";
import styled from "styled-components";
import { VoteListItemHookResult } from "./useVoteListItem";
export function VoteStatus({
  phase,
  isCommitted,
  decryptedVote,
  delegationStatus,
  isRevealed,
  canReveal,
  commitHash,
  revealHash,
  isFetching,
  isDirty,
}: VoteListItemHookResult) {
  function getCommittedOrRevealed() {
    if (phase === "commit") {
      if (isCommitted && !decryptedVote) {
        if (delegationStatus === "delegator") {
          return "Committed by Delegate";
        } else if (delegationStatus === "delegate") {
          return "Committed by Delegator";
        } else {
          return "Decrypt Error";
        }
      }
      return isCommitted ? "Committed" : "Not committed";
    } else {
      if (!isCommitted) return "Not committed";
      if (!decryptedVote || !canReveal) {
        if (delegationStatus === "delegator") {
          if (isRevealed) {
            return "Delegate revealed";
          } else {
            return "Delegate must reveal";
          }
        } else if (delegationStatus === "delegate") {
          if (isRevealed) {
            return "Delegator revealed";
          } else {
            return "Delegator must reveal";
          }
        } else {
          return "Unable to reveal";
        }
      }
      return isRevealed ? "Revealed" : "Not revealed";
    }
  }
  function getRelevantTransactionLink() {
    if (phase === "commit") {
      return commitHash ? (
        <Link href={config.makeTransactionHashLink(commitHash)} target="_blank">
          {getCommittedOrRevealed()}
        </Link>
      ) : (
        getCommittedOrRevealed()
      );
    }
    return revealHash ? (
      <Link href={config.makeTransactionHashLink(revealHash)} target="_blank">
        {getCommittedOrRevealed()}
      </Link>
    ) : (
      getCommittedOrRevealed()
    );
  }
  function getDotColor() {
    if (phase === "commit") {
      return isCommitted ? green : red500;
    } else {
      return isRevealed ? green : red500;
    }
  }

  if (isFetching) return <LoadingSkeleton width="8vw" />;

  return (
    <VoteStatusWrapper>
      <DotIcon
        style={
          {
            "--dot-color": getDotColor(),
          } as CSSProperties
        }
      />{" "}
      {getRelevantTransactionLink()}
      {isDirty ? "*" : ""}
    </VoteStatusWrapper>
  );
}

const VoteStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: max-content;
  white-space: nowrap;

  @media ${tabletAndUnder} {
    margin-left: 0;
  }
`;

const DotIcon = styled(Dot)`
  circle {
    fill: var(--dot-color);
  }
`;

const Link = styled(NextLink)`
  font: var(--text-md);
  color: var(--black);
  text-decoration: underline;
  &:hover {
    color: var(--black-opacity-50);
  }
`;
