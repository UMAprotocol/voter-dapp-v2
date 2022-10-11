import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingContractAddress } from "constants/addresses";

export async function getTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  const result = await votingTokenContract.functions.allowance(address, votingContractAddress);
  return result?.[0];
}
