import { formatFixed, parseFixed } from "@ethersproject/bignumber";
import { maxInt256, minInt256 } from "constant/web3/numbers";
import { BigNumber, BigNumberish } from "ethers";
import {
  decodeMultipleQuery,
  encryptMessage,
  getPrecisionForIdentifier,
  getRandomSignedInt,
  solidityKeccak256,
} from "helpers";
import {
  DropdownItemT,
  FormatVotesToCommit,
  ResultsT,
  VoteFormattedToCommitT,
  VoteT,
} from "types";

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
  signingKey,
}: FormatVotesToCommit) {
  // the user's address is called `account` for legacy reasons
  const account = address;
  // we just need a random number to make the hash
  const salt = getRandomSignedInt().toString();
  // we created this key when the user signed the message when first connecting their wallet
  const signingPublicKey = signingKey.publicKey;
  // this should have been saved in local storage when the user connected their wallet
  const hasSignedMessage = Boolean(signingKey.signedMessage);
  if (!hasSignedMessage) {
    throw new Error(
      "You must sign the message to commit votes. Please re-connect your wallet and try again."
    );
  }

  const formattedVotes = await Promise.all(
    votes.map(async (vote) => {
      // see if the user provided an answer for this vote
      const selectedVote = selectedVotes[vote.uniqueKey];
      // if not, exclude this vote from the final array
      if (!selectedVote) return null;

      const { identifier, decodedIdentifier, ancillaryData, time } = vote;
      // the selected option for a vote is called `price` for legacy reasons
      const price = parseVoteStringWithPrecision(
        selectedVote,
        decodedIdentifier
      );

      // the hash must be created with exactly these values in exactly this order
      const hash = makeVoteHash(
        price,
        salt,
        account,
        time,
        ancillaryData,
        roundId,
        identifier
      );
      // encrypt the hash with the signed message we created when the user first connected their wallet
      const encryptedVote = await encryptMessage(
        signingPublicKey,
        JSON.stringify({ price, salt })
      );

      return {
        ...vote,
        hash,
        encryptedVote,
      };
    })
  );

  return formattedVotes.filter((vote): vote is VoteFormattedToCommitT =>
    Boolean(vote)
  );
}
export function formatVotesToReveal(decryptedVotesForUser: VoteT[]) {
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

export function parseVoteStringWithPrecision(
  vote: string,
  decodedIdentifier: string
) {
  // do not format encoded strings with precision
  if (decodedIdentifier === "MULTIPLE_VALUES") {
    return vote;
  }
  // check the precision to use from our table of precisions
  const identifierPrecision = BigNumber.from(
    getPrecisionForIdentifier(decodedIdentifier)
  ).toString();
  return parseFixed(vote, identifierPrecision).toString();
}

export function formatVoteStringWithPrecision(
  vote: BigNumberish,
  decodedIdentifier: string
) {
  // do not format encoded strings with precision
  if (decodedIdentifier === "MULTIPLE_VALUES") {
    return vote.toString();
  }
  // check the precision to use from our table of precisions
  const identifierPrecision = BigNumber.from(
    getPrecisionForIdentifier(decodedIdentifier)
  ).toString();
  const formatted = formatFixed(vote, identifierPrecision).toString();
  // if the formatted number ends with .0, remove the .0
  return formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
}

export function formatMultipleValuesVote(
  result: ResultsT[number],
  options: DropdownItemT[] | undefined,
  proposedPrice: string | undefined
): {
  label: string;
  value: number;
  formattedValue: Record<string, string> | undefined | string;
} {
  function formatOptionsFromVote(
    vote: string | undefined,
    options: DropdownItemT[] | undefined
  ) {
    if (options && options?.length && vote) {
      const values = decodeMultipleQuery(vote, options.length);
      // set input values for display purposes
      return Object.fromEntries(
        options?.map((o, i) => [o.label, values[i].toString()])
      );
    }
  }

  const formattedVoteResults = [
    {
      label: "Unresolvable",
      price: maxInt256.toString(),
      formattedValue: undefined,
    },
    {
      label: "Early Request",
      price: minInt256.toString(),
      formattedValue: undefined,
    },
    {
      label: "Proposed Price",
      price: proposedPrice,
      formattedValue: formatOptionsFromVote(proposedPrice, options),
    },
  ].find((o) => o.price === result.vote);

  const formattedValue =
    result.vote === maxInt256.toString()
      ? "Unresolvable"
      : result.vote === minInt256.toString()
      ? "Early Request"
      : formatOptionsFromVote(result.vote, options);

  return {
    label: formattedVoteResults?.label ?? "Custom values",
    value: result.tokensVotedWith,
    formattedValue,
  };
}
