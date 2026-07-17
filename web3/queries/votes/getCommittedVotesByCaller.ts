import { VotingV2Ethers } from "@uma/contracts-frontend";
import { voteEventsBlockLookback } from "constant";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { queryFilterInChunks } from "helpers/web3/queryFilterInChunks";
import { VoteExistsByKeyT } from "types";

// This function differs from getCommittedVotes by filtering by the caller of the vote, not the voter.
// Use this in the case where we need to see that a delegate voted, as they are the caller, and the delegator is the voter.
export async function getCommittedVotesByCaller(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  roundId: number
) {
  if (!address) return {};
  const filter = votingContract.filters.VoteCommitted(
    null,
    address,
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
  const eventData = result?.filter(({ args }) => args.roundId === roundId);
  const committedVotes: VoteExistsByKeyT = {};
  eventData?.forEach(({ args, transactionHash }) => {
    const { identifier, time, ancillaryData } = args;
    const decodedIdentifier = decodeHexString(identifier);
    committedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = transactionHash;
  });
  return committedVotes;
}
