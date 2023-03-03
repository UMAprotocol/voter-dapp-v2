import { VotingV2Ethers } from "@uma/contracts-frontend";

export function getStakedBalance(
  votingContract: VotingV2Ethers,
  address: string
) {
  return votingContract.callStatic.getVoterStakePostUpdate(address);
}
