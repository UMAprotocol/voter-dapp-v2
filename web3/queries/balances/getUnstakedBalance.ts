import { VotingTokenEthers } from "@uma/contracts-frontend";

export async function getUnstakedBalance(
  votingTokenContract: VotingTokenEthers,
  address: string
) {
  const result = await votingTokenContract.functions.balanceOf(address);
  return result?.[0];
}
