import { VotingV2Ethers } from "@uma/contracts-frontend";

export function getUnstakeCoolDown(votingContract: VotingV2Ethers) {
  return votingContract.unstakeCoolDown();
}
