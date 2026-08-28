/**
 * Deep links into the Explorer dapp (https://explorer.uma.xyz), which replaces
 * the retired oracle dapp (oracle.uma.xyz).
 *
 * The two dapps address requests differently. The oracle dapp took
 * `?transactionHash=&chainId=&oracleType=`; the explorer has no chain or
 * oracle-type dimension in its URLs. It resolves a request by searching its
 * request index for the transaction hash and then disambiguating with
 * `eventIndex`, which it matches against the request / proposal / dispute /
 * settle events recorded on each request round. `/requests` is the route that
 * reads both params.
 *
 * `eventIndex` is only needed when one transaction produced more than one
 * request round; the explorer resolves a single-request transaction without
 * it, and falls back to a filtered list rather than erroring when a hash is
 * ambiguous.
 */
export const explorerBaseUrl = "https://explorer.uma.xyz";

/**
 * The explorer indexes Polygon mainnet only. There is no testnet deployment,
 * so testnet builds of this app intentionally render no request link.
 */
export const explorerSupportedChainIds: readonly number[] = [137];

/**
 * The explorer indexes permissionless and managed OptimisticOracleV2 requests.
 * OptimisticOracle (v1), SkinnyOptimisticOracle and OptimisticOracleV3 have no
 * explorer page.
 */
export const explorerSupportedOracleTypes: readonly string[] = [
  "OptimisticOracleV2",
  "ManagedOptimisticOracleV2",
];

/**
 * Whether the explorer has a page for this request at all. Requests outside
 * its coverage get no link rather than a link into an empty result set.
 */
export function isExplorerSupportedRequest(
  chainId: string | number | undefined,
  oracleType: string | undefined
): boolean {
  if (chainId === undefined || oracleType === undefined) return false;
  return (
    explorerSupportedChainIds.includes(Number(chainId)) &&
    explorerSupportedOracleTypes.includes(oracleType)
  );
}

export function constructExplorerRequestLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined,
  eventIndex?: string | undefined
): string | undefined {
  if (!txHash) return;
  if (!isExplorerSupportedRequest(chainId, oracleType)) return;

  const params = new URLSearchParams({ transactionHash: txHash });
  if (eventIndex !== undefined && eventIndex !== "") {
    params.set("eventIndex", eventIndex);
  }

  return `${explorerBaseUrl}/requests?${params.toString()}`;
}
