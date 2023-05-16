import { VotingV2Ethers } from "@uma/contracts-frontend";
import { BigNumber } from "ethers";

export function getStakedBalance(
  votingContract: VotingV2Ethers,
  address: string | undefined
) {
  if (!address) return BigNumber.from(0);
  return votingContract.callStatic.getVoterStakePostUpdate(address);
}
