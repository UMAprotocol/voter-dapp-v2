import { VotingV2Ethers } from "@uma/contracts-frontend";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import { VoteExistsByKeyT } from "types";

export async function getRevealedVotes(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: number
) {
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
  const result = await votingContract.queryFilter(filter);
  const eventData = result
    ?.map(({ args }) => args)
    .filter((args) => args.roundId.toNumber() === roundId);
  const revealedVotes: VoteExistsByKeyT = {};

  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    const decodedIdentifier = decodeHexString(identifier);
    revealedVotes[
      makeUniqueKeyForVote(decodedIdentifier, time, ancillaryData)
    ] = true;
  });

  return revealedVotes;
}
