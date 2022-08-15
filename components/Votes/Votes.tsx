import { useWallets } from "@web3-onboard/react";
import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import { getAccountDetails } from "components/Wallet";
import { BigNumber, ethers } from "ethers";
import unixTimestampToDate from "helpers/unixTimestampToDate";
import { useContractsContext } from "hooks/useContractsContext";
import useCurrentRoundId from "hooks/useCurrentRoundId";
import { usePanelContext } from "hooks/usePanelContext";
import useRoundEndTime from "hooks/useRoundEndTime";
import useVotePhase from "hooks/useVotePhase";
import { useState } from "react";
import styled from "styled-components";
import { VotePhaseT, VoteT } from "types/global";
import { parseFixed } from "@ethersproject/bignumber";
import { encryptMessage, getRandomSignedInt, getPrecisionForIdentifier } from "helpers/crypto";
import { useWalletContext } from "hooks/useWalletContext";
import signingMessage from "constants/signingMessage";
import useVotes from "hooks/useVotes";

export function Votes() {
  const connectedWallets = useWallets();
  const { address } = getAccountDetails(connectedWallets);
  const { voting } = useContractsContext();
  const votes = useVotes(address);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const { signer, signingKeys } = useWalletContext();
  const { votePhase } = useVotePhase(voting);
  const { currentRoundId } = useCurrentRoundId(voting);
  const { roundEndTime } = useRoundEndTime(voting, currentRoundId);

  console.log({ votes });

  function selectVote(vote: VoteT, value: string) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
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

  async function formatVotesToCommit(votes: VoteT[], selectedVotes: Record<string, string>) {
    // the user's address is called `account` for legacy reasons
    const account = address;
    // we just need a random number to make the hash
    const salt = getRandomSignedInt().toString();
    const roundId = currentRoundId!.toNumber();
    // we created this key when the user signed the message when first connecting their wallet
    const signingPublicKey = signingKeys[address].publicKey;

    const newSignedMessage = await signer?.signMessage(signingMessage);
    const oldSignedMessage = signingKeys[address].signedMessage;

    if (newSignedMessage !== oldSignedMessage) {
      throw new Error("Signed messages do not match. Please disconnect and re-sign");
    }

    const formattedVotes = await Promise.all(
      votes.map(async (vote) => {
        // see if the user provided an answer for this vote
        const selectedVote = selectedVotes[vote.uniqueKey];
        // if not, exclude this vote from the final array
        if (!selectedVote) return null;

        const { identifier, decodedIdentifier, ancillaryData, time } = vote;
        // check the precision to use from our table of precisions
        const identifierPrecision = BigNumber.from(getPrecisionForIdentifier(decodedIdentifier)).toString();
        // the selected option for a vote is called `price` for legacy reasons
        const price = parseFixed(selectedVote, identifierPrecision).toString();
        // the hash must be created with exactly these values in exactly this order
        const hash = makeVoteHash(price, salt, account, time, ancillaryData, roundId, identifier);
        // encrypt the hash with the signed message we created when the user first connected their wallet
        const encryptedVote = await encryptMessage(signingPublicKey, JSON.stringify({ price, salt }));

        return {
          price,
          salt,
          account,
          time,
          ancillaryData,
          roundId,
          identifier,
          hash,
          encryptedVote,
        };
      })
    );

    return formattedVotes.filter((vote) => vote && vote.price !== "");
  }

  async function commitVotes() {
    if (!votes) return;

    const formattedVotes = await formatVotesToCommit(votes, selectedVotes);
    if (!formattedVotes.length) return;

    const commitVoteFunctionFragment = voting.interface.getFunction(
      "commitAndEmitEncryptedVote(bytes32,uint256,bytes,bytes32,bytes)"
    );
    const calldata = formattedVotes
      .map((vote) => {
        if (!vote) return null;
        const { identifier, time, ancillaryData, hash, encryptedVote } = vote;
        // @ts-expect-error todo figure out why it thinks this doesn't exist
        return voting.interface.encodeFunctionData(commitVoteFunctionFragment, [
          identifier,
          time,
          ancillaryData,
          hash,
          encryptedVote,
        ]);
      })
      .filter((encoded): encoded is string => Boolean(encoded));

    await voting.functions.multicall(calldata);
  }

  async function formatVotesToReveal(decryptedVotesForUser: VoteT[]) {
    return decryptedVotesForUser.map((vote) => {
      if (vote.isRevealed || !vote.decryptedVote) return null;

      const { identifier, decryptedVote, ancillaryData, time } = vote;
      const { price, salt } = decryptedVote;

      return {
        identifier,
        time,
        price,
        ancillaryData,
        salt,
      };
    });
  }

  async function revealVotes() {
    const formattedVotes = await formatVotesToReveal(votes);
    if (!formattedVotes.length) return;

    const revealVoteFunctionFragment = voting.interface.getFunction("revealVote(bytes32,uint256,int256,bytes,int256)");

    const calldata = formattedVotes
      .map((vote) => {
        if (!vote) return null;
        const { identifier, time, price, ancillaryData, salt } = vote;
        // @ts-expect-error todo figure out why it thinks this doesn't exist
        return voting.interface.encodeFunctionData(revealVoteFunctionFragment, [
          identifier,
          time,
          price,
          ancillaryData,
          salt,
        ]);
      })
      .filter((encoded): encoded is string => Boolean(encoded));

    await voting.functions.multicall(calldata);
  }

  function openVotePanel(vote: VoteT) {
    const panelContent = {
      ...vote,
    };
    setPanelType("vote");
    setPanelContent(panelContent);
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
        {votePhase && roundEndTime ? (
          <VoteTimeline phase={votePhase} phaseEnds={unixTimestampToDate(roundEndTime)} />
        ) : null}
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>Your vote</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {determineVotesToShow(votes, votePhase).map((vote) => (
            <VoteBar
              vote={vote}
              selectedVote={selectedVotes[vote.uniqueKey]}
              selectVote={selectVote}
              phase={votePhase}
              key={vote.uniqueKey}
              moreDetailsAction={() => openVotePanel(vote)}
            />
          ))}
        </VotesWrapper>
        <CommitVotesButtonWrapper>
          <Button
            variant="primary"
            label={`${votePhase} Votes`}
            onClick={votePhase === "commit" ? commitVotes : revealVotes}
          />
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
