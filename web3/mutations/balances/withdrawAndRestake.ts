import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";
import { formatNumberForDisplay } from "helpers";
import { AddNotificationT } from "types";

export async function withdrawAndRestake({
  voting,
  outstandingRewards,
  addNotification,
}: {
  voting: VotingV2Ethers;
  outstandingRewards: BigNumber;
  addNotification: AddNotificationT;
}) {
  const tx = await voting.functions.withdrawAndRestake();
  addNotification(`Withdrawing and restaking ${formatNumberForDisplay(outstandingRewards)} UMA...`, tx.hash);
  return await tx.wait();
}
