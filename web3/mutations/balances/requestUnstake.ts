import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export async function requestUnstake({
  voting,
  unstakeAmount,
  addNotification,
}: {
  voting: VotingV2Ethers;
  unstakeAmount: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  addNotification(`Requesting unstake of ${formatNumberForDisplay(unstakeAmount)} UMA...`, tx.hash);
  return await tx.wait();
}
