import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegator {
  voting: VotingV2Ethers;
  delegatorAddress: string;
}
export function setDelegator({ voting, delegatorAddress }: SetDelegator) {
  return voting.setDelegator(delegatorAddress);
}
