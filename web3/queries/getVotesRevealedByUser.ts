import { VotingV2Ethers } from "@uma/contracts-frontend";
import { makeUniqueKeyForVote } from "helpers/votes";
import { VoteExistsByKeyT } from "types/global";

export default async function getVotesRevealedByUser(votingContract: VotingV2Ethers, address: string | undefined) {
  const filter = votingContract.filters.VoteRevealed(address, null, null, null, null, null, null, null);
  const result = await votingContract.queryFilter(filter);
  const eventData = result?.map(({ args }) => args);
  const revealedVotes: VoteExistsByKeyT = {};

  eventData?.forEach(({ identifier, time, ancillaryData }) => {
    revealedVotes[makeUniqueKeyForVote(identifier, time, ancillaryData)] = true;
  });

  return revealedVotes;
}
