import { VotingTokenEthers } from "@uma/contracts-frontend";

import { appConfig } from "helpers/config";
const { votingContractAddress } = appConfig;

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
