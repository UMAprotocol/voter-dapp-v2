import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export default function getRoundEndTime(votingContract: VotingV2Ethers, roundId: BigNumber | undefined) {
  if (!roundId) return null;
  return votingContract.functions.getRoundEndTime(roundId);
}
