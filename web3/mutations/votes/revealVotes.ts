import {
  formatVotesToReveal,
  handleNotifications,
  MAX_PRIORITY_FEE_PER_GAS,
} from "helpers";
import { RevealVotes } from "types";

export async function revealVotes({ votesToReveal, voting }: RevealVotes) {
  const formattedVotes = formatVotesToReveal(votesToReveal);

  if (!formattedVotes.length) return;

  if (formattedVotes.length === 1) {
    const vote = formattedVotes[0];

    if (!vote) return;

    const { identifier, time, price, ancillaryData, salt } = vote;

    const tx = await voting.functions.revealVote(
      identifier,
      time,
      price,
      ancillaryData,
      salt,
      { maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS }
    );

    return handleNotifications(tx, {
      pending: `Revealing 1 vote...`,
      success: `Revealed 1 vote`,
      error: `Failed to reveal 1 vote`,
    });
  }

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

  return handleNotifications(tx, {
    pending: `Revealing ${formattedVotes.length} votes...`,
    success: `Revealed ${formattedVotes.length} votes`,
    error: `Failed to reveal ${formattedVotes.length} votes`,
  });
}
