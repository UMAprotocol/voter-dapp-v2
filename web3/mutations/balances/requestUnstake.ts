import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function requestUnstake({ voting, unstakeAmount }: { voting: VotingV2Ethers; unstakeAmount: BigNumber }) {
  const tx = await voting.functions.requestUnstake(unstakeAmount);
  return await tx.wait();
}
