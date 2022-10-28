import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export default async function stake({
  voting,
  stakeAmount,
  addNotification,
}: {
  voting: VotingV2Ethers;
  stakeAmount: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await voting.functions.stake(stakeAmount);
  addNotification(`Staking ${formatNumberForDisplay(stakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
