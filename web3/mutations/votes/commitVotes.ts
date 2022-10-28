import { CommitVotes } from "types";

export async function commitVotes({ voting, formattedVotes, addPendingNotification }: CommitVotes) {
  if (!formattedVotes.length) return;

  const commitVoteFunctionFragment = voting.interface.getFunction(
    "commitAndEmitEncryptedVote(bytes32,uint256,bytes,bytes32,bytes)"
  );
  const calldata = formattedVotes.flatMap((vote) => {
    if (!vote) return [];

    const { identifier, time, ancillaryData, hash, encryptedVote } = vote;
    // @ts-expect-error todo figure out why it thinks this doesn't exist
    return voting.interface.encodeFunctionData(commitVoteFunctionFragment, [
      identifier,
      time,
      ancillaryData,
      hash,
      encryptedVote,
    ]);
  });
  const tx = await voting.functions.multicall(calldata);
  addPendingNotification("Committing votes...", tx.hash);
  return tx.wait();
}
