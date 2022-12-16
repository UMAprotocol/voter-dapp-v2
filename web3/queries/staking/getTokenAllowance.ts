import { VotingTokenEthers } from "@uma/contracts-frontend";

import { config } from "helpers/config";
const { votingContractAddress } = config;

export async function getTokenAllowance(
  votingTokenContract: VotingTokenEthers,
  address: string
) {
  const result = await votingTokenContract.functions.allowance(
    address,
    votingContractAddress
  );
  return result?.[0];
}
