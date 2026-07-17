import { VotingV2Ethers } from "@uma/contracts-frontend";
import { voteEventsBlockLookback } from "constant";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { queryFilterInChunks } from "helpers/web3/queryFilterInChunks";
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
  const result = await queryFilterInChunks(
    votingContract,
    filter,
    currentBlock - voteEventsBlockLookback,
    currentBlock
  );
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
