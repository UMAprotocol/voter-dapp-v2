import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getStakedBalance(votingContract: VotingV2Ethers, address: string) {
  return votingContract.functions.getVoterStake(address);
}
