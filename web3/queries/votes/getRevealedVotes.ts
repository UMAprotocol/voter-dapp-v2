import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { VoteExistsByKeyT } from "types";

export async function getRevealedVotes(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  roundId: number
): Promise<VoteExistsByKeyT> {
  if (!address) return {};
  const filter = votingContract.filters.VoteRevealed(
    address,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );
  const currentBlock = await votingContract.provider.getBlockNumber();
  const result = await votingContract.queryFilter(filter, currentBlock - 10000);
  const eventData = result.filter(({ args }) => args.roundId === roundId);
  const revealedVotes: VoteExistsByKeyT = {};

  eventData?.forEach(({ args, transactionHash }) => {
    const { identifier, time, ancillaryData } = args;
    const decodedIdentifier = decodeHexString(identifier);
    revealedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = transactionHash;
  });

  return revealedVotes;
}
