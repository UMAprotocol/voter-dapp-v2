import { VotingV2Ethers } from "@uma/contracts-frontend";
import { onlyOneRequestPerAddress } from "helpers";
import { getIgnoredRequestToBeDelegateAddresses } from "./getIgnoredRequestToBeDelegateAddresses";

export async function getDelegateSetEvents(
  voting: VotingV2Ethers,
  address: string,
  queryFor: "delegate" | "delegator"
) {
  const args = queryFor === "delegate" ? [null, address] : [address, null];
  const filter = voting.filters.DelegateSet(...args);
  const events = await voting.queryFilter(filter);
  const ignoredDelegateSetEvents = await getIgnoredRequestToBeDelegateAddresses(address);
  const parsedEvents = events
    .map((event) => ({
      delegate: event.args.delegate,
      delegator: event.args.delegator,
      transactionHash: event.transactionHash,
    }))
    .filter(({ delegator }) => !ignoredDelegateSetEvents.includes(delegator));

  return onlyOneRequestPerAddress(parsedEvents, queryFor);
}
