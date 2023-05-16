import { VotingV2Ethers } from "@uma/contracts-frontend";
import { zeroAddress } from "helpers";

export function getDelegateToStaker(
  voting: VotingV2Ethers,
  delegateAddress: string
) {
  if (!delegateAddress) return zeroAddress;
  return voting.delegateToStaker(delegateAddress);
}
