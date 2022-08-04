import { VotingV2Ethers } from "@uma/contracts-frontend";

export default function getCurrentRoundId(votingContract: VotingV2Ethers) {
  return votingContract.functions.getCurrentRoundId();
}
