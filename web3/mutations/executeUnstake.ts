import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function executeUnstake({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.functions.executeUnstake();
  return await tx.wait();
}
