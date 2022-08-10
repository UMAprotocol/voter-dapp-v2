import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export default function getEncryptedVotesForUser(
  votingContract: VotingV2Ethers,
  address: string,
  roundId: BigNumber | undefined,
) {
  const filter = votingContract.filters.EncryptedVote(address, roundId?.toNumber() ?? null, null, null, null, null);
  return votingContract.queryFilter(filter);
}
