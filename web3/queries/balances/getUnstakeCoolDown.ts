import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getUnstakeCoolDown(votingContract: VotingV2Ethers) {
  const unstakeCoolDown = await votingContract.unstakeCoolDown();
  return { unstakeCoolDown: unstakeCoolDown.toNumber() };
}
