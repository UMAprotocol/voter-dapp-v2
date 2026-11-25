import {
  formatVotesToReveal,
  getGasFeeOverrides,
  sendWithGasCheck,
} from "helpers";
import { RevealVotes } from "types";

// Resolve after broadcast; the caller tracks confirmation separately.
export async function revealVotes({ votesToReveal, voting }: RevealVotes) {
  const formattedVotes = formatVotesToReveal(votesToReveal);

  if (!formattedVotes.length) return;
  const gasOverrides = await getGasFeeOverrides(voting.provider);

  if (formattedVotes.length === 1) {
    const vote = formattedVotes[0];

    if (!vote) return;

    const { identifier, time, price, ancillaryData, salt } = vote;
    const args = [identifier, time, price, ancillaryData, salt] as const;

    return sendWithGasCheck({
      signer: voting.signer,
      gasOverrides,
      estimateGas: () => voting.estimateGas.revealVote(...args),
      send: () => voting.functions.revealVote(...args, gasOverrides),
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

  return sendWithGasCheck({
    signer: voting.signer,
    gasOverrides,
    estimateGas: () => voting.estimateGas.multicall(calldata),
    send: () => voting.functions.multicall(calldata, gasOverrides),
  });
}
