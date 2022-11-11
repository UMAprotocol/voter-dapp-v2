import {
  Button,
  Pagination,
  Tooltip,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
  VoteTimeline,
} from "components";
import { formatVotesToCommit, getEntriesForPage } from "helpers";
import {
  useAccountDetails,
  useCommittedVotesForDelegator,
  useCommitVotes,
  useContractsContext,
  useDelegationContext,
  useInitializeVoteTiming,
  usePaginationContext,
  usePanelContext,
  useRevealVotes,
  useStakingContext,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types";

export function Votes() {
  const {
    getActiveVotes,
    getUpcomingVotes,
    getPastVotes,
    getActivityStatus,
    getUserDependentIsFetching,
  } = useVotesContext();
  const { phase, roundId } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const { signer, signingKeys } = useWalletContext();
  const { voting } = useContractsContext();
  const { stakedBalance } = useStakingContext();
  const { getDelegationStatus } = useDelegationContext();
  const { data: committedVotesForDelegator } = useCommittedVotesForDelegator();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes();
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes();
  const { openPanel } = usePanelContext();
  const {
    pageStates: {
      activeVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});

  const hasStaked = stakedBalance?.gt(0) ?? false;
  const hasCommittedWithDelegator =
    getDelegationStatus() === "delegate" &&
    Object.keys(committedVotesForDelegator).length > 0;

  useInitializeVoteTiming();

  async function commitVotes() {
    if (!address || !canCommit()) return;

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
    if (!address || !canReveal()) return;

    revealVotesMutation({
      voting,
      votesToReveal: getVotesToReveal(),
    });
  }

  function getVotesToReveal() {
    return getActiveVotes().filter(
      (vote) =>
        vote.isCommitted && !!vote.decryptedVote && vote.isRevealed === false
    );
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
    return (
      phase === "commit" &&
      hasStaked &&
      !!signer &&
      !!Object.keys(selectedVotes).length &&
      !isCommittingVotes
    );
  }

  function canReveal() {
    return (
      phase === "reveal" &&
      hasStaked &&
      !hasCommittedWithDelegator &&
      getVotesToReveal().length &&
      !isRevealingVotes
    );
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

  const votesToShow = getEntriesForPage(
    pageNumber,
    resultsPerPage,
    determineVotesToShow()
  );

  const CommitRevealButton = () => (
    <Button
      variant="primary"
      label={`${phase} Votes`}
      onClick={phase === "commit" ? commitVotes : revealVotes}
      disabled={!(canCommit() || canReveal())}
    />
  );

  const ButtonMaybeWithTooltip = () => {
    const hasStakedMessage = "You must stake UMA to commit or reveal votes.";
    const hasCommittedWithDelegatorMessage =
      "You cannot reveal with a delegate wallet if you have already committed votes with your delegator wallet.";

    if (!hasStaked) {
      return (
        <Tooltip label={hasStakedMessage}>
          <CommitRevealButton />
        </Tooltip>
      );
    }

    if (phase === "reveal" && hasCommittedWithDelegator) {
      return (
        <Tooltip label={hasCommittedWithDelegatorMessage}>
          <CommitRevealButton />
        </Tooltip>
      );
    }

    return <CommitRevealButton />;
  };

  return (
    <>
      <Title>{determineTitle()}</Title>
      <VoteTimeline />
      <VotesTableWrapper>
        <VotesList
          headings={<VotesTableHeadings activityStatus={getActivityStatus()} />}
          rows={votesToShow.map((vote) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              selectedVote={selectedVotes[vote.uniqueKey]}
              selectVote={(value) => selectVote(value, vote)}
              activityStatus={getActivityStatus()}
              moreDetailsAction={() => openVotePanel(vote)}
              key={vote.uniqueKey}
              isFetching={
                getUserDependentIsFetching() ||
                isCommittingVotes ||
                isRevealingVotes
              }
            />
          ))}
        />
      </VotesTableWrapper>
      {getActivityStatus() === "active" ? (
        <CommitVotesButtonWrapper>
          <ButtonMaybeWithTooltip />
        </CommitVotesButtonWrapper>
      ) : null}
      <PaginationWrapper>
        <Pagination
          paginateFor="activeVotesPage"
          numberOfEntries={determineVotesToShow().length}
        />
      </PaginationWrapper>
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

const PaginationWrapper = styled.div`
  margin-top: 10px;
`;
