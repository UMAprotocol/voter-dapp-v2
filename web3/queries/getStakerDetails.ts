import { VotingV2Ethers } from "@uma/contracts-frontend";
import getCanUnstakeTime from "helpers/getCanUnstakeTime";

export default async function getStakerDetails(votingContract: VotingV2Ethers, address: string) {
  if (!address) return {};

  const result = await votingContract.voterStakes(address);
  const { pendingUnstake, unstakeRequestTime } = result ?? {};

  const unstakeRequestTimeAsDate = new Date(Number(unstakeRequestTime) * 1000);
  const canUnstakeTime = getCanUnstakeTime(unstakeRequestTimeAsDate);

  return {
    pendingUnstake,
    unstakeRequestTime: unstakeRequestTimeAsDate,
    canUnstakeTime,
  };
}
