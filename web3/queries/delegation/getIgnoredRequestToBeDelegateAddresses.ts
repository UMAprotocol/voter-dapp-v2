import { getIgnoredRequestToBeDelegateAddressesFromStorage } from "helpers";

export function getIgnoredRequestToBeDelegateAddresses(
  ignoredByAddress: string | undefined
) {
  if (!ignoredByAddress) return [];
  const ignoredRequestToBeDelegateAddresses =
    getIgnoredRequestToBeDelegateAddressesFromStorage();

  return ignoredRequestToBeDelegateAddresses[ignoredByAddress] ?? [];
}
