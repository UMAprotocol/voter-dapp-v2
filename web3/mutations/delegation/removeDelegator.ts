import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export function removeDelegator({ voting }: { voting: VotingV2Ethers }) {
  return voting.setDelegator(zeroAddress);
}
