import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getVotesCommittedByUser(votingContract: VotingV2Ethers, address: string | undefined) {
  const filter = votingContract.filters.VoteCommitted(address, null, null, null, null, null);
  return votingContract.queryFilter(filter);
}
