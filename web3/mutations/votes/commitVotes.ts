import { handleNotifications } from "helpers";
import { CommitVotes } from "types";

export async function commitVotes({ voting, formattedVotes }: CommitVotes) {
  if (!formattedVotes.length) return;

  if (formattedVotes.length === 1) {
    const vote = formattedVotes[0];

    if (!vote) return;

    const { identifier, time, ancillaryData, hash, encryptedVote } = vote;

    const tx = await voting.functions.commitAndEmitEncryptedVote(
      identifier,
      time,
      ancillaryData,
      hash,
      encryptedVote
    );

    return handleNotifications(tx, {
      pending: `Committing 1 vote...`,
      success: `Committed 1 vote`,
      error: `Failed to commit 1 vote`,
    });
  }

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
  return handleNotifications(tx, {
    pending: `Committing ${formattedVotes.length} votes...`,
    success: `Committed ${formattedVotes.length} votes`,
    error: `Failed to commit ${formattedVotes.length} votes`,
  });
}
