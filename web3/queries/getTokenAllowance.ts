import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";
import { BigNumber } from "ethers";

export default async function getTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  if (!address) return BigNumber.from(0);

  const result = await votingTokenContract.functions.allowance(address, votingContractAddress);
  return result?.[0];
}
