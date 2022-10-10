import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getDelegateSetEvents(voting: VotingV2Ethers, address: string) {
  const filter = voting.filters.DelegateSet(null, address);
  const events = await voting.queryFilter(filter);
  return events.map((event) => ({
    delegate: event.args.delegate,
    delegator: event.args.delegator,
    transactionHash: event.transactionHash,
  }));
}
