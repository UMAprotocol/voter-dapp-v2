import { getIgnoredRequestToBeDelegateAddressesFromStorage } from "helpers";

export function getIgnoredRequestToBeDelegateAddresses(
  ignoredByAddress: string
) {
  const ignoredRequestToBeDelegateAddresses =
    getIgnoredRequestToBeDelegateAddressesFromStorage();

  return ignoredRequestToBeDelegateAddresses[ignoredByAddress] ?? [];
}
