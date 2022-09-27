import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import { BigNumber } from "ethers";
import { solidityKeccak256 } from "helpers";
import { FormatVotesToCommit, VoteFormattedToCommitT, VoteT } from "types/global";
import { encryptMessage, getPrecisionForIdentifier, getRandomSignedInt } from "./crypto";

function makeVoteHash(
  price: string,
  salt: string,
  account: string,
  time: number,
  ancillaryData: string,
  roundId: number,
  identifier: string
) {
  return solidityKeccak256(
    ["uint256", "uint256", "address", "uint256", "bytes", "uint256", "bytes32"],
    [price, salt, account, time, ancillaryData, roundId, identifier]
  );
}

export async function formatVotesToCommit({
  votes,
  selectedVotes,
  roundId,
  address,
  signingKeys,
}: FormatVotesToCommit) {
  // the user's address is called `account` for legacy reasons
  const account = address;
  // we just need a random number to make the hash
  const salt = getRandomSignedInt().toString();
  // we created this key when the user signed the message when first connecting their wallet
  const signingPublicKey = signingKeys[address].publicKey;
  // this should have been saved in local storage when the user connected their wallet
  const hasSignedMessage = Boolean(signingKeys[address].signedMessage);
  if (!hasSignedMessage) {
    throw new Error("You must sign the message to commit votes. Please re-connect your wallet and try again.");
  }

  const formattedVotes = await Promise.all(
    votes.map(async (vote) => {
      // see if the user provided an answer for this vote
      const selectedVote = selectedVotes[vote.uniqueKey];
      // if not, exclude this vote from the final array
      if (!selectedVote) return null;

      const { identifier, decodedIdentifier, ancillaryData, time } = vote;
      // the selected option for a vote is called `price` for legacy reasons
      const price = parseVoteStringWithPrecision(selectedVote, decodedIdentifier);
      // the hash must be created with exactly these values in exactly this order
      const hash = makeVoteHash(price, salt, account, time, ancillaryData, roundId, identifier);
      // encrypt the hash with the signed message we created when the user first connected their wallet
      const encryptedVote = await encryptMessage(signingPublicKey, JSON.stringify({ price, salt }));

      return {
        ...vote,
        hash,
        encryptedVote,
      };
    })
  );

  return formattedVotes.filter((vote): vote is VoteFormattedToCommitT => Boolean(vote));
}
export async function formatVotesToReveal(decryptedVotesForUser: VoteT[]) {
  return decryptedVotesForUser.flatMap((vote) => {
    if (vote.isRevealed || !vote.isCommitted || !vote.decryptedVote) return [];

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

export function parseVoteStringWithPrecision(vote: string, decodedIdentifier: string) {
  // check the precision to use from our table of precisions
  const identifierPrecision = BigNumber.from(getPrecisionForIdentifier(decodedIdentifier)).toString();
  return parseFixed(vote, identifierPrecision).toString();
}

export function formatVoteStringWithPrecision(vote: string, decodedIdentifier: string) {
  // check the precision to use from our table of precisions
  const identifierPrecision = BigNumber.from(getPrecisionForIdentifier(decodedIdentifier)).toString();
  return formatFixed(vote, identifierPrecision).toString();
}
