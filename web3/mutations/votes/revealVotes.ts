import { formatVotesToReveal, getGasFeeOverrides } from "helpers";
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

    return voting.functions.revealVote(
      identifier,
      time,
      price,
      ancillaryData,
      salt,
      gasOverrides
    );
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

  return voting.functions.multicall(calldata, gasOverrides);
}
