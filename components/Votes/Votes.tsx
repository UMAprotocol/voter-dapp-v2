import { useWallets } from "@web3-onboard/react";
import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import { getAccountDetails } from "components/Wallet";
import { ethers } from "ethers";
import unixTimestampToDate from "helpers/unixTimestampToDate";
import { useContractsContext } from "hooks/useContractsContext";
import useCurrentRoundId from "hooks/useCurrentRoundId";
import { usePanelContext } from "hooks/usePanelContext";
import useRoundEndTime from "hooks/useRoundEndTime";
import useVotePhase from "hooks/useVotePhase";
import { useState } from "react";
import styled from "styled-components";
import { VoteT } from "types/global";
import { parseFixed } from "@ethersproject/bignumber";
import { encryptMessage, getRandomSignedInt, getPrecisionForIdentifier } from "helpers/crypto";

interface Props {
  votes: VoteT[];
}
export function Votes({ votes }: Props) {
  const initialSelectedVotes: Record<string, string> = {};
  votes.forEach((vote) => {
    initialSelectedVotes[makeUniqueKeyForVote(vote)] = "";
  });
  const connectedWallets = useWallets();
  const [selectedVotes, setSelectedVotes] = useState(initialSelectedVotes);
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const { voting } = useContractsContext();
  const { votePhase } = useVotePhase(voting);
  const { currentRoundId } = useCurrentRoundId(voting);
  const { roundEndTime } = useRoundEndTime(voting, currentRoundId);

  function selectVote(vote: VoteT, value: string) {
    setSelectedVotes((votes) => ({ ...votes, [makeUniqueKeyForVote(vote)]: value }));
  }

  function makeUniqueKeyForVote(vote: VoteT) {
    return `${vote.identifier}-${vote.time}-${vote.ancillaryData}`;
  }

  function makeVoteHash(
    price: string,
    salt: string,
    account: string,
    time: number,
    ancillaryData: string,
    roundId: number,
    identifier: string
  ) {
    return ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "uint256", "bytes", "uint256", "bytes32"],
      [price, salt, account, time, ancillaryData, roundId, identifier]
    );
  }

  function formatVotesToCommit(votes: VoteT[], selectedVotes: Record<string, string>) {
    const { address } = getAccountDetails(connectedWallets);
    return votes
      .map((vote) => {
        const selectedVote = selectedVotes[makeUniqueKeyForVote(vote)];
        const { identifier, decodedIdentifier, ancillaryData, time } = vote;
        const salt = getRandomSignedInt().toString();
        const identifierPrecision = getPrecisionForIdentifier(decodedIdentifier);
        const price = parseFixed(selectedVote, identifierPrecision).toString();
        const roundId = currentRoundId!.toNumber();
        const account = address;
        const hash = makeVoteHash(price, salt, account, time, ancillaryData, roundId, identifier);
        return {
          price,
          salt,
          account,
          time,
          ancillaryData,
          roundId,
          identifier,
          hash,
        };
      })
      .filter((vote) => vote.price !== "");
  }

  function commitVotes() {
    console.log({ selectedVotes });
  }

  function makeVoteLinks(txid: string, umipNumber: number) {
    return [
      {
        label: `UMIP ${umipNumber}`,
        href: `https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-${umipNumber}.md`,
      },
      {
        label: "Dispute transaction",
        href: `https://etherscan.io/tx/${txid}`,
      },
      {
        label: "Optimistic Oracle UI",
        href: `https://oracle.umaproject.org/request?requester=${txid}`,
      },
    ];
  }

  function openVotePanel(vote: VoteT) {
    const panelContent = {
      ...vote,
      links: makeVoteLinks(vote.txid, vote.umipNumber),
      discordLink: "https://www.todo.com",
    };
    setPanelType("vote");
    setPanelContent(panelContent);
    setPanelOpen(true);
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>Vote on active disputes:</Title>
        {votePhase && roundEndTime ? (
          <VoteTimeline phase={votePhase} phaseEnds={unixTimestampToDate(roundEndTime)} />
        ) : null}
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>Your vote</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {votes.map((vote) => (
            <VoteBar
              vote={vote}
              selectedVote={selectedVotes[makeUniqueKeyForVote(vote)]}
              selectVote={selectVote}
              key={makeUniqueKeyForVote(vote)}
              moreDetailsAction={() => openVotePanel(vote)}
            />
          ))}
        </VotesWrapper>
        <CommitVotesButtonWrapper>
          <Button variant="primary" label="Commit votes" onClick={commitVotes} />
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
`;
