import { VotingV2Ethers } from "@uma/contracts-frontend";

export function getDelegateToStaker(voting: VotingV2Ethers, delegateAddress: string) {
  return voting.delegateToStaker(delegateAddress);
}
