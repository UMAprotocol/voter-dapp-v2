import { useWallets } from "@web3-onboard/react";
import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import { getAccountDetails } from "components/Wallet";
import { formatVotesToCommit, formatVotesToReveal } from "helpers/formatVotes";
import { useContractsContext, usePanelContext, useVotesContext, useWalletContext } from "hooks/contexts";
import useVoteTimingContext from "hooks/contexts/useVoteTimingContext";
import useInitializeVoteTiming from "hooks/helpers/useInitializeVoteTiming";
import { useState } from "react";
import styled from "styled-components";
import { SelectedVotesByKeyT, VotePhaseT, VoteT } from "types/global";

export function Votes() {
  const connectedWallets = useWallets();
  const { address } = getAccountDetails(connectedWallets);
  const { voting } = useContractsContext();
  const { getActiveVotes } = useVotesContext();
  const votes = getActiveVotes();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const { signer, signingKeys } = useWalletContext();
  const { phase, roundId } = useVoteTimingContext();

  useInitializeVoteTiming();

  function selectVote(vote: VoteT, value: string) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function openVotePanel(vote: VoteT) {
    setPanelType("vote");
    setPanelContent(vote);
    setPanelOpen(true);
  }

  function determineVotesToShow(votes: VoteT[], phase: VotePhaseT) {
    if (phase === "commit") return votes;
    return votes.filter((vote) => !!vote.decryptedVote && vote.isCommitted === true);
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>Vote on active disputes:</Title>
        <VoteTimeline />
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>Your vote</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {determineVotesToShow(votes, phase).map((vote) => (
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
        <CommitVotesButtonWrapper>
          <Button variant="primary" label={`${phase} Votes`} onClick={phase === "commit" ? commitVotes : revealVotes} />
        </CommitVotesButtonWrapper>
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
