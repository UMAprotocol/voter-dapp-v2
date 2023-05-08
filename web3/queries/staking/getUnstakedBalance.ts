import { VotingTokenEthers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export async function getUnstakedBalance(
  votingTokenContract: VotingTokenEthers,
  address: string
) {
  if (!address) return BigNumber.from(0);
  const result = await votingTokenContract.functions.balanceOf(address);
  return result?.[0];
}
