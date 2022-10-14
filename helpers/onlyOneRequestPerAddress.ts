import { DelegationEventT } from "types/global";

export function onlyOneRequestPerAddress(delegationEvents: DelegationEventT[], queryFor: "delegate" | "delegator") {
  const uniqueAddresses = new Set(delegationEvents.map((event) => event[queryFor]));
  return Array.from(uniqueAddresses).map((address) => delegationEvents.find((event) => event[queryFor] === address));
}
