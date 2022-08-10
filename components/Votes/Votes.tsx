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
import { VoteT } from "types/global";
import { parseFixed } from "@ethersproject/bignumber";
import { encryptMessage, getRandomSignedInt, getPrecisionForIdentifier } from "helpers/crypto";
import { useWalletContext } from "hooks/useWalletContext";
import useEncryptedVotesForUser from "hooks/useEncryptedVotesForUser";
import useActiveVotes from "hooks/useActiveVotes";
import { sub } from "date-fns";

export function Votes() {
  const votes = makeMockVotes();
  const initialSelectedVotes: Record<string, string> = {};
  votes?.forEach((vote) => {
    initialSelectedVotes[makeUniqueKeyForVote(vote)] = "";
  });
  const connectedWallets = useWallets();
  const { address } = getAccountDetails(connectedWallets);
  const [selectedVotes, setSelectedVotes] = useState(initialSelectedVotes);
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const { voting } = useContractsContext();
  const { signingKeys } = useWalletContext();
  const { votePhase } = useVotePhase(voting);
  const { currentRoundId } = useCurrentRoundId(voting);
  const { roundEndTime } = useRoundEndTime(voting, currentRoundId);
  const { encryptedVotesForUser } = useEncryptedVotesForUser(voting, address, currentRoundId);
  const { activeVotes } = useActiveVotes(voting);

  console.log({ encryptedVotesForUser });

  function makeMockVotes() {
    if (!activeVotes) return null;
    return activeVotes.map(
      ({ identifier, decodedIdentifier, ancillaryData, decodedAncillaryData, time, timeMilliseconds }, i) => ({
        identifier,
        ancillaryData,
        decodedIdentifier,
        decodedAncillaryData,
        time,
        timeMilliseconds,
        title: decodedIdentifier,
        origin: i % 2 === 0 ? ("UMA" as const) : ("Polymarket" as const),
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        voteNumber: 100 + i,
        timestamp: sub(new Date(), { days: 1 }),
        txid: "0x12345667890987655" + i,
        umipNumber: 200 + i,
        links: [
          {
            label: "UMIP link",
            href: "https://www.todo.com",
          },
          {
            label: "Dispute txid",
            href: "https://www.todo.com",
          },
          {
            label: "Optimistic Oracle UI",
            href: "https://www.todo.com",
          },
        ],
        discordLink: "https://www.todo.com",
        options: [
          { label: "Yes", value: "0", secondaryLabel: "p0" },
          { label: "No", value: "1", secondaryLabel: "p1" },
          { label: "Unknown", value: "2", secondaryLabel: "p2" },
          { label: "Early Request", value: "3", secondaryLabel: "p3" },
        ],
        participation: [
          { label: "Total Votes", value: 188077355.982231 },
          { label: "Unique Commit Addresses", value: 100 },
          { label: "Unique Reveal Addresses", value: 97 },
        ],
        results: [
          {
            label: "Devin Haney",
            value: 1234,
          },
          {
            label: "George Washington",
            value: 5678,
          },
          {
            label: "Tie",
            value: 500,
          },
          {
            label: "Early Expiry",
            value: 199,
          },
        ],
        isCommitted: i % 2 === 0,
        isGovernance: i % 2 === 0,
      })
    );
  }

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

  async function formatVotesToCommit(votes: VoteT[], selectedVotes: Record<string, string>) {
    // the user's address is called `account` for legacy reasons
    const account = address;
    // we just need a random number to make the hash
    const salt = getRandomSignedInt().toString();
    const roundId = currentRoundId!.toNumber();
    // we created this key when the user signed the message when first connecting their wallet
    const signingPublicKey = signingKeys[address].publicKey;

    const formattedVotes = await Promise.all(
      votes.map(async (vote) => {
        // see if the user provided an answer for this vote
        const selectedVote = selectedVotes[makeUniqueKeyForVote(vote)];
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
    const formattedVotes = await formatVotesToCommit(votes, selectedVotes);
    const commitVoteFunctionFragment = voting.interface.getFunction(
      "commitAndEmitEncryptedVote(bytes32,uint256,bytes,bytes32,bytes)"
    );
    const calldata = formattedVotes.map((vote) => {
      // @ts-expect-error todo figure out why it thinks this doesn't exist
      return voting.interface.encodeFunctionData(commitVoteFunctionFragment, [
        vote!.identifier,
        vote!.time,
        vote!.ancillaryData,
        vote!.hash,
        vote!.encryptedVote,
      ]);
    });
    const tx = await voting.functions.multicall(calldata);
    console.log({ tx });
  }

  async function revealVotes() {}

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
          {votes?.map((vote) => (
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
