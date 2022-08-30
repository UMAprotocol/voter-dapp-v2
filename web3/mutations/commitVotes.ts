import { formatVotesToCommit } from "helpers/formatVotes";
import { CommitVotes } from "types/global";

export default async function commitVotes({
  voting,
  votes,
  selectedVotes,
  roundId,
  address,
  signingKeys,
  signer,
}: CommitVotes) {
  if (!votes || !signer) return;

  const formattedVotes = await formatVotesToCommit({ votes, selectedVotes, roundId, address, signingKeys, signer });
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
  await voting.functions.multicall(calldata);
}
