import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
}
export async function setDelegate({ voting, delegateAddress }: SetDelegate) {
  const tx = await voting.setDelegate(delegateAddress);
  return tx.wait();
}
