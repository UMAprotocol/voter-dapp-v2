import { VotingTokenEthers } from "@uma/contracts-frontend";

export default function getUnstakedBalance(votingTokenContract: VotingTokenEthers, address: string) {
  return votingTokenContract.functions.balanceOf(address);
}
