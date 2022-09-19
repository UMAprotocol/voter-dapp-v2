import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";

export default async function getTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  const result = await votingTokenContract.functions.allowance(address, votingAddress);
  return result?.[0];
}
