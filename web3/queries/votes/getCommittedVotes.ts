import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { VoteExistsByKeyT } from "types";

export async function getCommittedVotes(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  roundId: number
) {
  if (!address) return {};

  const filter = votingContract.filters.VoteCommitted(
    address,
    null,
    null,
    null,
    null,
    null
  );
  const currentBlock = await votingContract.provider.getBlockNumber();
  const result = await votingContract.queryFilter(
    filter,
    currentBlock - 100000
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
