import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { VoteExistsByKeyT } from "types";

export async function getCommittedVotes(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: number
) {
  const filter = votingContract.filters.VoteCommitted(
    address,
    null,
    null,
    null,
    null,
    null
  );
  const result = await votingContract.queryFilter(filter);
  const eventData = result
    ?.map(({ args }) => args)
    .filter((args) => args.roundId.toNumber() === roundId);
  const committedVotes: VoteExistsByKeyT = {};
  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    const decodedIdentifier = decodeHexString(identifier);
    committedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = true;
  });
  return committedVotes;
}
