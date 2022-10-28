import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getDelegatorSetEvents(
  voting: VotingV2Ethers,
  address: string,
  queryFor: "delegate" | "delegator"
) {
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegatorSet(...args);
  const events = await voting.queryFilter(filter);
  return events.map((event) => ({
    delegate: event.args.delegate,
    delegator: event.args.delegator,
    transactionHash: event.transactionHash,
  }));
}
