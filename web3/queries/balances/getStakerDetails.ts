import { VotingV2Ethers } from "@uma/contracts-frontend";
import { getCanUnstakeTime } from "helpers";

export async function getStakerDetails(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.voterStakes(address);
  const { stake: stakedBalance, pendingUnstake, unstakeRequestTime, delegate } = result ?? {};

  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime) * 1000);
  const canUnstakeTime = getCanUnstakeTime(unstakeRequestTimeAsDate);

  return {
    stakedBalance,
    pendingUnstake,
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
    delegate,
  };
}
