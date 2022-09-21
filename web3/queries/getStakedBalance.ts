import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export default async function getStakedBalance(votingContract: VotingV2Ethers, address: string) {
  if (!address) return BigNumber.from(0);

  const result = await votingContract.functions.getVoterStake(address);
  return result?.[0];
}
