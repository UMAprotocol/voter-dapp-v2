import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export function removeDelegate({ voting }: { voting: VotingV2Ethers }) {
  return voting.setDelegate(zeroAddress);
}
