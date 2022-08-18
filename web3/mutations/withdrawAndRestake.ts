import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function withdrawAndRestake({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.functions.withdrawAndRestake();
  return await tx.wait(1);
}
