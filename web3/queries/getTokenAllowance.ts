import { VotingTokenEthers } from "@uma/contracts-frontend";
import { votingAddress } from "constants/addresses";

export default function getTokenAllowance(votingTokenContract: VotingTokenEthers, address: string) {
  return votingTokenContract.functions.allowance(address, votingAddress);
}
