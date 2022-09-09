import { Button } from "components/Button";
import { VotesTableRow } from "components/VotesTable";
import VotesTable from "components/VotesTable/VotesTable";
import VotesTableHeadings from "components/VotesTable/VotesTableHeadings";
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
import { useAccountDetails } from "hooks/queries";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types/global";

export function Votes() {
  const { getActiveVotes, getUpcomingVotes, getPastVotes, getActivityStatus } = useVotesContext();
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
    const formattedVotes = await formatVotesToCommit({
      votes: getActiveVotes(),
      selectedVotes,
      roundId,
      address,
      signingKeys,
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
    const status = getActivityStatus();
    if (status === "active") {
      if (phase === "commit") return getActiveVotes();
      return getVotesToReveal();
    }
    if (status === "upcoming") {
      return getUpcomingVotes();
    }
    return getPastVotes();
  }

  function canCommit() {
    return phase === "commit" && !!signer && !!Object.keys(selectedVotes).length && !contractInteractionInProgress;
  }

  function canReveal() {
    return phase === "reveal" && getVotesToReveal().length && !contractInteractionInProgress;
  }

  function determineTitle() {
    const status = getActivityStatus();
    switch (status) {
      case "active":
        return "Active votes:";
      case "upcoming":
        return "Upcoming votes:";
      default:
        return "Past votes:";
    }
  }

  function hasActiveOrUpcomingVotes() {
    const status = getActivityStatus();
    return status === "active" || status === "upcoming";
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>{determineTitle()}</Title>
        {hasActiveOrUpcomingVotes() ? <VoteTimeline /> : null}
        <VotesTableWrapper>
          <VotesTable
            headings={<VotesTableHeadings activityStatus={getActivityStatus()} />}
            rows={determineVotesToShow().map((vote) => (
              <VotesTableRow
                vote={vote}
                phase={phase}
                selectedVote={selectedVotes[vote.uniqueKey]}
                selectVote={selectVote}
                activityStatus={getActivityStatus()}
                moreDetailsAction={() => openVotePanel(vote)}
                key={vote.uniqueKey}
              />
            ))}
          />
        </VotesTableWrapper>
        {getActivityStatus() === "active" ? (
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

const VotesTableWrapper = styled.div`
  margin-top: 35px;
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
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
