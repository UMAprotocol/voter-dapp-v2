import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export async function removeDelegator({
  voting,
  notify,
}: {
  voting: VotingV2Ethers;
  notify: (transactionHash: string) => void;
}) {
  const tx = await voting.setDelegator(zeroAddress);
  notify(tx.hash);
  return tx.wait();
}
