import { Button, VotesTable, VotesTableHeadings, VotesTableRow, VoteTimeline } from "components";
import { formatVotesToCommit } from "helpers";
import {
  useAccountDetails,
  useCommittedVotesForDelegator,
  useCommitVotes,
  useContractsContext,
  useDelegationContext,
  useHandleError,
  useInitializeVoteTiming,
  useNotificationsContext,
  usePanelContext,
  useRevealVotes,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types";

export function Votes() {
  const { getActiveVotes, getUpcomingVotes, getPastVotes, getActivityStatus, getUserDependentIsFetching } =
    useVotesContext();
  const { phase, roundId } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const { signer, signingKeys } = useWalletContext();
  const { voting } = useContractsContext();
  const { getDelegationStatus } = useDelegationContext();
  const { data: committedVotesForDelegator } = useCommittedVotesForDelegator();
  const handleError = useHandleError();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes();
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes();
  const { openPanel } = usePanelContext();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const { addNotification, removeNotification } = useNotificationsContext();

  useInitializeVoteTiming();

  async function commitVotes() {
    if (!address) return;

    const formattedVotes = await formatVotesToCommit({
      votes: getActiveVotes(),
      selectedVotes,
      roundId,
      address,
      signingKeys,
    });

    commitVotesMutation(
      {
        voting,
        formattedVotes,
        addNotification,
      },
      {
        onSuccess: (data) => {
          setSelectedVotes({});
          if (!data) return;
          removeNotification(data.transactionHash);
          addNotification("Votes Committed!", data.transactionHash);
        },
      }
    );
  }

  function revealVotes() {
    const cannotRevealWhenDelegatorHasCommittedErrorMessage =
      "Cannot reveal votes with delegate wallet when delegator has committed votes";
    if (getDelegationStatus() === "delegate" && Object.keys(committedVotesForDelegator).length > 0) {
      handleError(cannotRevealWhenDelegatorHasCommittedErrorMessage);
    }

    revealVotesMutation(
      {
        voting,
        votesToReveal: getVotesToReveal(),
        addNotification,
      },
      {
        onSuccess(data) {
          if (!data) return;
          removeNotification(data.transactionHash);
          addNotification("Votes Revealed!", data.transactionHash);
        },
      }
    );
  }

  function getVotesToReveal() {
    return getActiveVotes().filter((vote) => vote.isCommitted && !!vote.decryptedVote && vote.isRevealed === false);
  }

  function selectVote(value: string, vote: VoteT) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function openVotePanel(vote: VoteT) {
    openPanel("vote", vote);
  }

  function determineVotesToShow() {
    const status = getActivityStatus();
    switch (status) {
      case "active":
        return getActiveVotes();
      case "upcoming":
        return getUpcomingVotes();
      case "past":
        return getPastVotes();
    }
  }

  function canCommit() {
    return phase === "commit" && !!signer && !!Object.keys(selectedVotes).length && !isCommittingVotes;
  }

  function canReveal() {
    return phase === "reveal" && getVotesToReveal().length && !isRevealingVotes;
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

  return (
    <>
      <Title>{determineTitle()}</Title>
      <VoteTimeline />
      <VotesTableWrapper>
        <VotesTable
          headings={<VotesTableHeadings activityStatus={getActivityStatus()} />}
          rows={determineVotesToShow().map((vote) => (
            <VotesTableRow
              vote={vote}
              phase={phase}
              selectedVote={selectedVotes[vote.uniqueKey]}
              selectVote={(value) => selectVote(value, vote)}
              activityStatus={getActivityStatus()}
              moreDetailsAction={() => openVotePanel(vote)}
              key={vote.uniqueKey}
              isFetching={getUserDependentIsFetching() || isCommittingVotes || isRevealingVotes}
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
    </>
  );
}

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
