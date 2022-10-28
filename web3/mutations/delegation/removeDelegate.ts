import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export async function removeDelegate({
  voting,
  notify,
}: {
  voting: VotingV2Ethers;
  notify: (transactionHash: string) => void;
}) {
  const tx = await voting.setDelegate(zeroAddress);
  notify(tx.hash);
  return tx.wait();
}
