import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getVotePhase(votingContract: VotingV2Ethers) {
  return votingContract.functions.getVotePhase();
}
