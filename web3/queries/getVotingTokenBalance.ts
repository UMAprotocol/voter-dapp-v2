import { VotingTokenEthers } from "@uma/contracts-frontend";

export default function getVotingTokenBalance(votingTokenContract: VotingTokenEthers, address: string) {
  return votingTokenContract.functions.balanceOf(address);
}
