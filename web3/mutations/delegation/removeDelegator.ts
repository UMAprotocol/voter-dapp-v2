import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export async function removeDelegator({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.setDelegator(zeroAddress);
  return tx.wait();
}
