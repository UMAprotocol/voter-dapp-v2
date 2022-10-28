import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export async function removeDelegate({ voting }: { voting: VotingV2Ethers }) {
  const tx = await voting.setDelegate(zeroAddress);
  return tx.wait();
}
