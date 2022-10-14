import { getIgnoredRequestToBeDelegateAddressesFromStorage } from "helpers/getIgnoredRequestToBeDelegateAddressesFromStorage";

export async function getIgnoredRequestToBeDelegateAddresses(ignoredByAddress: string) {
  const ignoredRequestToBeDelegateAddresses = getIgnoredRequestToBeDelegateAddressesFromStorage();

  return ignoredRequestToBeDelegateAddresses[ignoredByAddress] ?? [];
}
