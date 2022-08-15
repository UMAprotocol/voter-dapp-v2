import { DisputeOriginT, PriceRequest, PriceRequestWithVoteDetails, VoteT } from "types/global";
import useActiveVotes from "./useActiveVotes";
import { useContractsContext } from "./useContractsContext";
import useCurrentRoundId from "./useCurrentRoundId";
import { useWalletContext } from "./useWalletContext";
import useWithDecryptedVotes from "./useWithDecryptedVotes";
import useWithEncryptedVotes from "./useWithEncryptedVotes";
import useWithIsCommitted from "./useWithIsCommitted";
import useWithIsRevealed from "./useWithIsRevealed";

export default function useVotes(address: string | undefined) {
  const { voting } = useContractsContext();
  const { signingKeys } = useWalletContext();
  const { activeVotes } = useActiveVotes(voting);
  const { currentRoundId } = useCurrentRoundId(voting);

  const { withIsCommitted } = useWithIsCommitted(voting, address, activeVotes);
  const { withIsRevealed } = useWithIsRevealed(voting, address, withIsCommitted);

  const { withEncryptedVotes } = useWithEncryptedVotes(voting, address, currentRoundId, withIsRevealed);
  const withDecryptedVotes = useWithDecryptedVotes(withEncryptedVotes, address, signingKeys);

  const votes = addVoteDetails(withDecryptedVotes) as VoteT[];

  return {
    votes,
  };
}

function addVoteDetails(votes: PriceRequest[]) {
  const withTitle = addTitle(votes);
  const withIsGovernance = addIsGovernance(withTitle);
  const withOrigin = addOrigin(withIsGovernance);
  const withTxId = addTxId(withOrigin);
  const withUmipNumber = addUmipNumber(withTxId);
  const withDescription = addDescription(withUmipNumber);
  const withOptions = addOptions(withDescription);
  const withLinks = addLinks(withOptions);
  const withDiscordLink = addDiscordLink(withLinks);

  return withDiscordLink as PriceRequestWithVoteDetails[];
}

function addOptions(votes: PriceRequest[]) {
  // todo add polymarket options
  return votes.map((vote) => {
    let options;
    if (vote.decodedIdentifier.includes("Admin") || vote.decodedIdentifier === "YES_OR_NO_QUERY") {
      options = [
        { label: "Yes", value: 0 },
        { label: "No", value: 1 },
      ];
    }
    return {
      ...vote,
      options,
    };
  });
}

function addUmipNumber(votes: PriceRequest[]) {
  return votes.map((vote) => {
    // todo get from ancillary data if not admin
    const umipNumber = vote.decodedIdentifier.includes("Admin") ? vote.decodedIdentifier.split("-")[1] : "todo";
    return {
      ...vote,
      umipNumber,
    };
  });
}

function addDescription(votes: PriceRequest[]) {
  return votes.map((vote) => {
    // todo wire up to ancillary data
    const description = vote.decodedAncillaryData;

    return {
      ...vote,
      description,
    };
  });
}

function addTxId(votes: PriceRequest[]) {
  return votes.map((vote) => ({
    ...vote,
    // todo find tx id
    txId: "0x1234",
  }));
}

function addOrigin(votes: PriceRequest[]) {
  return votes.map((vote) => ({
    ...vote,
    // todo wire up to ancillary data
    origin: vote.decodedIdentifier.includes("Admin") ? "UMA" : ("Polymarket" as DisputeOriginT),
  }));
}

function addTitle(votes: PriceRequest[]) {
  return votes.map((vote) => ({
    ...vote,
    title: vote.decodedIdentifier,
  }));
}

function addIsGovernance(votes: PriceRequest[]) {
  return votes.map((vote) => ({
    ...vote,
    isGovernance: vote.decodedIdentifier.includes("Admin"),
  }));
}

function addLinks(votes: PriceRequest[]) {
  const links = [
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
  ];
  return votes.map((vote) => ({
    ...vote,
    links,
  }));
}

function addDiscordLink(votes: PriceRequest[]) {
  return votes.map((vote) => ({
    ...vote,
    discordLink: "https://discord.com/invite/todo",
  }));
}

// function makeVoteLinks(txid: string, umipNumber: number) {
//   return [
//     {
//       label: `UMIP ${umipNumber}`,
//       href: `https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-${umipNumber}.md`,
//     },
//     {
//       label: "Dispute transaction",
//       href: `https://etherscan.io/tx/${txid}`,
//     },
//     {
//       label: "Optimistic Oracle UI",
//       href: `https://oracle.umaproject.org/request?requester=${txid}`,
//     },
//   ];
// }
