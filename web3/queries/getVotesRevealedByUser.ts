import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getVotesRevealedByUser(votingContract: VotingV2Ethers, address: string | undefined) {
  const filter = votingContract.filters.VoteRevealed(address, null, null, null, null, null, null, null);
  return votingContract.queryFilter(filter);
}
