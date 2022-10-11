import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function stake({ voting, stakeAmount }: { voting: VotingV2Ethers; stakeAmount: BigNumber }) {
  const tx = await voting.functions.stake(stakeAmount);
  return await tx.wait();
}
