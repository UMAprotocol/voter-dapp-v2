import { VotingV2Ethers } from "@uma/contracts-frontend";
import getCanUnstakeTime from "helpers/getCanUnstakeTime";

export default async function getStakerDetails(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.voterStakes(address);
  const { stake, pendingUnstake, unstakeRequestTime } = result ?? {};

  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime) * 1000);
  const canUnstakeTime = getCanUnstakeTime(unstakeRequestTimeAsDate);

  return {
    stakedBalance: stake,
    pendingUnstake,
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
  };
}
