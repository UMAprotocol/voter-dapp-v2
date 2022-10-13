import { VotingV2Ethers } from "@uma/contracts-frontend";

interface SetDelegate {
  voting: VotingV2Ethers;
  delegateAddress: string;
}
export function setDelegate({ voting, delegateAddress }: SetDelegate) {
  return voting.setDelegate(delegateAddress);
}
