import { VotingV2Ethers } from "@uma/contracts-frontend";

export default async function getVotePhase(votingContract: VotingV2Ethers) {
  return await votingContract.functions.getVotePhase();
}
