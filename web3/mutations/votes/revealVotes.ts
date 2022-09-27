import { formatVotesToReveal } from "helpers";
import { RevealVotes } from "types/global";

export default async function revealVotes({ votesToReveal, voting }: RevealVotes) {
  const formattedVotes = await formatVotesToReveal(votesToReveal);
  if (!formattedVotes.length) return;

  const revealVoteFunctionFragment = voting.interface.getFunction("revealVote(bytes32,uint256,int256,bytes,int256)");

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
  return tx.wait();
}
