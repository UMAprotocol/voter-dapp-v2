import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function withdrawRewards({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.functions.withdrawRewards();
  return await tx.wait();
}
