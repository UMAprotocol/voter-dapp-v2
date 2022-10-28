import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
  notify: (transactionHash: string) => void;
}
export async function setDelegator({ voting, delegatorAddress, notify }: SetDelegator) {
  const tx = await voting.setDelegator(delegatorAddress);
  notify(tx.hash);
  return tx.wait();
}
