import { getIgnoredRequestToBeDelegateAddressesFromStorage } from "helpers";

export async function getIgnoredRequestToBeDelegateAddresses(ignoredByAddress: string) {
  const ignoredRequestToBeDelegateAddresses = getIgnoredRequestToBeDelegateAddressesFromStorage();

  return ignoredRequestToBeDelegateAddresses[ignoredByAddress] ?? [];
}
