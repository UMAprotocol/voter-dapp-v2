import { VotingV2Ethers } from "@uma/contracts-frontend";
import { getCanUnstakeTime } from "helpers";
import { getUnstakeCoolDown } from "./getUnstakeCoolDown";

export async function getStakerDetails(
  votingContract: VotingV2Ethers,
  address: string
) {
  const result = await votingContract.voterStakes(address);
  const { unstakeCoolDown } = await getUnstakeCoolDown(votingContract);
  const {
    stake: stakedBalance,
    pendingUnstake,
    unstakeRequestTime,
    delegate,
    rewardsPaidPerToken,
  } = result ?? {};
  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime) * 1000);
  const canUnstakeTime = getCanUnstakeTime(
    unstakeRequestTimeAsDate,
    unstakeCoolDown
  );

  return {
    stakedBalance,
    pendingUnstake,
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
    delegate,
    rewardsPaidPerToken,
  };
}
