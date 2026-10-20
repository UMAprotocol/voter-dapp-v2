import { getGasFeeOverrides } from "helpers";
import { CommitVotes } from "types";

// Resolve after broadcast; the caller tracks confirmation separately.
export async function commitVotes({ voting, formattedVotes }: CommitVotes) {
  if (!formattedVotes.length) return;
  const gasOverrides = await getGasFeeOverrides(voting.provider);

  if (formattedVotes.length === 1) {
    const vote = formattedVotes[0];

    if (!vote) return;

    const { identifier, time, ancillaryData, hash, encryptedVote } = vote;

    return voting.functions.commitAndEmitEncryptedVote(
      identifier,
      time,
      ancillaryData,
      hash,
      encryptedVote,
      gasOverrides
    );
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

  return voting.functions.multicall(calldata, gasOverrides);
}
