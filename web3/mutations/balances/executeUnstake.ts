import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function executeUnstake({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.functions.executeUnstake();
  return await tx.wait();
}
