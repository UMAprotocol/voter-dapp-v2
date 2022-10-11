import { VotingV2Ethers } from "@uma/contracts-frontend";
import getUnstakeCoolDown from "./getUnstakeCoolDown";
import { getCanUnstakeTime } from "helpers";

export default async function getStakerDetails(votingContract: VotingV2Ethers, address: string) {
  const result = await votingContract.voterStakes(address);
  const { unstakeCoolDown } = await getUnstakeCoolDown(votingContract);
  const { stake: stakedBalance, pendingUnstake, unstakeRequestTime } = result ?? {};
  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime) * 1000);
  const canUnstakeTime = getCanUnstakeTime(unstakeRequestTimeAsDate, unstakeCoolDown);

  return {
    stakedBalance,
    pendingUnstake,
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
  };
}
