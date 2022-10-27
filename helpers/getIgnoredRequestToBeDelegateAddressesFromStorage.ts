export function getIgnoredRequestToBeDelegateAddressesFromStorage() {
  const ignoredRequestToBeDelegateAddresses = JSON.parse(
    window.localStorage.getItem("ignoredRequestToBeDelegateAddresses") ?? "{}"
  ) as Record<string, string[]>;

  return ignoredRequestToBeDelegateAddresses;
}
