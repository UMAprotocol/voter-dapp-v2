import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export async function withdrawRewards({
  voting,
  outstandingRewards,
  addNotification,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await voting.functions.withdrawRewards();
  addNotification(`Withdrawing ${formatNumberForDisplay(outstandingRewards)} UMA rewards...`, tx.hash);
  return await tx.wait();
}
