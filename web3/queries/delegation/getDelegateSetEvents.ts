import { VotingV2Ethers } from "@uma/contracts-frontend";

export async function getDelegateSetEvents(
  voting: VotingV2Ethers,
  address: string,
  queryFor: "delegate" | "delegator"
) {
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegateSet(...args);
  const events = await voting.queryFilter(filter);
  const ignoredDelegateSetEvents = JSON.parse(localStorage.getItem("ignoredDelegateSetEvents") ?? "[]") as string[];
  return events
    .map((event) => ({
      delegate: event.args.delegate,
      delegator: event.args.delegator,
      transactionHash: event.transactionHash,
    }))
    .filter(({ delegator }) => !ignoredDelegateSetEvents.includes(delegator));
}
