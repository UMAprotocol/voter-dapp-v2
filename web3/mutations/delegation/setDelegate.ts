import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
  notify: (transactionHash: string) => void;
}
export async function setDelegate({ voting, delegateAddress, notify }: SetDelegate) {
  const tx = await voting.setDelegate(delegateAddress);
  notify(tx.hash);
  return tx.wait();
}
