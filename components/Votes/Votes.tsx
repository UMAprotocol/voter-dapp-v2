import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import { formatVotesToCommit } from "helpers/formatVotes";
import {
  useContractsContext,
  usePanelContext,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks/contexts";
import { useInitializeVoteTiming } from "hooks/helpers";
import { useCommitVotes, useRevealVotes } from "hooks/mutations";
import { useAccountDetails, usePastVotes } from "hooks/queries";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types/global";

export function Votes() {
  const { hasActiveVotes, getActiveVotes, getUpcomingVotes, getPastVotes } = useVotesContext();
  const { phase, roundId } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const { signer, signingKeys } = useWalletContext();
  const { voting } = useContractsContext();
  const commitVotesMutation = useCommitVotes();
  const revealVotesMutation = useRevealVotes();
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const [contractInteractionInProgress, setContractInteractionInProgress] = useState(false);

  useInitializeVoteTiming();

  async function commitVotes() {
    if (!signer) return;

    const formattedVotes = await formatVotesToCommit({
      votes: getActiveVotes(),
      selectedVotes,
      roundId,
      address,
      signingKeys,
      signer,
    });

    setContractInteractionInProgress(true);

    commitVotesMutation(
      {
        voting,
        formattedVotes,
      },
      {
        onSuccess: () => {
          setSelectedVotes({});
        },
        onSettled: () => {
          setContractInteractionInProgress(false);
        },
      }
    );
  }

  function revealVotes() {
    revealVotesMutation(
      {
        voting,
        votesToReveal: getVotesToReveal(),
      },
      {
        onSettled: () => {
          setContractInteractionInProgress(false);
        },
      }
    );
  }

  function getVotesToReveal() {
    return getActiveVotes().filter((vote) => vote.isCommitted && !!vote.decryptedVote && vote.isRevealed === false);
  }

  function selectVote(vote: VoteT, value: string) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function openVotePanel(vote: VoteT) {
    setPanelType("vote");
    setPanelContent(vote);
    setPanelOpen(true);
  }

  function determineVotesToShow() {
    if (hasActiveVotes) {
      if (phase === "commit") return getActiveVotes();
      return getVotesToReveal();
    }
    const upcomingVotes = getUpcomingVotes();
    if (upcomingVotes.length) return upcomingVotes;
    return getPastVotes();
  }

  function canCommit() {
    return phase === "commit" && !!signer && !!Object.keys(selectedVotes).length && !contractInteractionInProgress;
  }

  function canReveal() {
    return phase === "reveal" && getVotesToReveal().length && !contractInteractionInProgress;
  }

  function determineTitle() {
    if (hasActiveVotes) return "Active votes:";
    if (getUpcomingVotes().length) return "Upcoming votes:";
    return "Past votes:";
  }

  function hasActiveOrUpcomingVotes() {
    return hasActiveVotes || getUpcomingVotes().length > 0;
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>{determineTitle()}</Title>
        {hasActiveOrUpcomingVotes() ? <VoteTimeline /> : null}
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>{hasActiveVotes ? "Your vote" : ""}</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {determineVotesToShow().map((vote) => (
            <VoteBar
              vote={vote}
              selectedVote={selectedVotes[vote.uniqueKey]}
              selectVote={selectVote}
              phase={phase}
              key={vote.uniqueKey}
              moreDetailsAction={() => openVotePanel(vote)}
            />
          ))}
        </VotesWrapper>
        {hasActiveVotes ? (
          <CommitVotesButtonWrapper>
            <Button
              variant="primary"
              label={`${phase} Votes`}
              onClick={phase === "commit" ? commitVotes : revealVotes}
              disabled={!(canCommit() || canReveal())}
            />
          </CommitVotesButtonWrapper>
        ) : null}
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  background: var(--grey-100);
`;

const InnerWrapper = styled.div`
  margin-inline: auto;
  max-width: var(--desktop-max-width);
  padding-inline: 45px;
  padding-block: 45px;
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const VotesWrapper = styled.div`
  > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

const TableHeadingsWrapper = styled.div`
  display: grid;
  grid-template-columns: 45% 240px 1fr;
  justify-items: start;
  margin-bottom: 5px;
  margin-top: 40px;
`;

const DisputeHeading = styled.h2`
  font: var(--text-sm);
`;

const YourVoteHeading = styled.h2`
  font: var(--text-sm);
`;

const VoteStatusHeading = styled.h2`
  margin-left: 45px;
  font: var(--text-sm);
`;

const CommitVotesButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  margin-top: 30px;

  button {
    text-transform: capitalize;
  }
`;
