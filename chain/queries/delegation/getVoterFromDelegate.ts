import { VotingV2Ethers } from "@uma/contracts-frontend";

export function getVoterFromDelegate(voting: VotingV2Ethers, address: string) {
  return voting.getVoterFromDelegate(address);
}
