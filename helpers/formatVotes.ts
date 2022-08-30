import { parseFixed } from "@ethersproject/bignumber";
import signingMessage from "constants/signingMessage";
import { BigNumber, ethers } from "ethers";
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
  return ethers.utils.solidityKeccak256(
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
  signer,
}: FormatVotesToCommit) {
  // the user's address is called `account` for legacy reasons
  const account = address;
  // we just need a random number to make the hash
  const salt = getRandomSignedInt().toString();
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
