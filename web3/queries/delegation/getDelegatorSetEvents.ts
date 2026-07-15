import { VotingV2Ethers } from "@uma/contracts-frontend";
import { config } from "helpers/config";

export async function getDelegatorSetEvents(
  voting: VotingV2Ethers,
  address: string | undefined,
  queryFor: "delegate" | "delegator"
) {
  if (!address) return [];
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegatorSet(...args);
  // events can't precede the contract, so don't ask the RPC to scan from genesis
  const events = await voting.queryFilter(filter, config.deployBlock);
  return events.map((event) => ({
    delegate: event.args.delegate,
    delegator: event.args.delegator,
    transactionHash: event.transactionHash,
  }));
}
