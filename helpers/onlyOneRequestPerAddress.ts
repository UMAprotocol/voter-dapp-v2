import { DelegationEventT } from "types";

export function onlyOneRequestPerAddress(delegationEvents: DelegationEventT[], queryFor: "delegate" | "delegator") {
  const uniqueAddresses = new Set<string>();
  const requestsFromUniqueAddresses: DelegationEventT[] = [];

  for (const event of delegationEvents) {
    const address = event[queryFor];
    if (!uniqueAddresses.has(address)) {
      uniqueAddresses.add(address);
      requestsFromUniqueAddresses.push(event);
    }
  }

  return requestsFromUniqueAddresses;
}
