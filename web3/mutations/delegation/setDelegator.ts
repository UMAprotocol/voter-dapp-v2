import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
}
export async function setDelegator({ voting, delegatorAddress }: SetDelegator) {
  const tx = await voting.setDelegator(delegatorAddress);
  return tx.wait();
}
