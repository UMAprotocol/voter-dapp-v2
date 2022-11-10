import { formatVotesToReveal, handleNotifications } from "helpers";
import { RevealVotes } from "types";

export async function revealVotes({ votesToReveal, voting }: RevealVotes) {
  const formattedVotes = formatVotesToReveal(votesToReveal);
  if (!formattedVotes.length) return;

  const revealVoteFunctionFragment = voting.interface.getFunction(
    "revealVote(bytes32,uint256,int256,bytes,int256)"
  );

  const calldata = formattedVotes.flatMap((vote) => {
    if (!vote) return [];

    const { identifier, time, price, ancillaryData, salt } = vote;

    // @ts-expect-error todo figure out why it thinks this doesn't exist
    return voting.interface.encodeFunctionData(revealVoteFunctionFragment, [
      identifier,
      time,
      price,
      ancillaryData,
      salt,
    ]);
  });

  const tx = await voting.functions.multicall(calldata);
  const shouldPluralize = formattedVotes.length > 1;
  return handleNotifications(tx, {
    pending: `Revealing ${formattedVotes.length} vote${
      shouldPluralize ? "s" : ""
    }...`,
    success: `Revealed ${formattedVotes.length} vote${
      shouldPluralize ? "s" : ""
    }`,
    error: `Failed to reveal ${formattedVotes.length} vote${
      shouldPluralize ? "s" : ""
    }`,
  });
}
