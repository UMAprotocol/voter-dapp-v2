import { Button, LoadingSpinner, VotesTable, VotesTableHeadings, VotesTableRow, VoteTimeline } from "components";
import { formatVotesToCommit } from "helpers";
import {
  useAccountDetails,
  useCommitVotes,
  useContractsContext,
  useInitializeVoteTiming,
  usePanelContext,
  useRevealVotes,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { PageInnerWrapper, PageOuterWrapper } from "pages/styles";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types";

export function Votes() {
  const {
    getActiveVotes,
    getUpcomingVotes,
    getPastVotes,
    getActivityStatus,
    getUserIndependentIsLoading,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase, roundId } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const { signer, signingKeys } = useWalletContext();
  const { voting } = useContractsContext();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes();
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes();
  const { openPanel } = usePanelContext();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});

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
      },
      {
        onSuccess: () => {
          setSelectedVotes({});
        },
      }
    );
  }

  function revealVotes() {
    revealVotesMutation({
      voting,
      votesToReveal: getVotesToReveal(),
    });
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
    <PageOuterWrapper>
      {getUserIndependentIsLoading() ? (
        <LoadingSpinnerWrapper>
          <LoadingSpinner size={300} variant="black" />
        </LoadingSpinnerWrapper>
      ) : (
        <PageInnerWrapper>
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
        </PageInnerWrapper>
      )}
    </PageOuterWrapper>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: 35px;
`;

const LoadingSpinnerWrapper = styled.div`
  width: 100%;
  padding-top: 50px;
  display: grid;
  place-items: center;
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
