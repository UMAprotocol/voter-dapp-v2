import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string | undefined,
  roundId: number | undefined
) {
  const filter = votingContract.filters.EncryptedVote(address, roundId ?? null, null, null, null, null);
  return votingContract.queryFilter(filter);
}
