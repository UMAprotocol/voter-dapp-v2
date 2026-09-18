import { supportedChains } from "constant/web3/supportedChains";

/**
 * Deep links from a DVM vote to the oracle request behind it.
 *
 * Requests the Explorer dapp (https://explorer.uma.xyz) serves go there.
 * Everything else keeps the oracle dapp (oracle.uma.xyz) link it has today,
 * so no vote loses its request link while explorer coverage catches up.
 *
 * The two dapps address requests differently. The oracle dapp takes
 * `?transactionHash=&chainId=&oracleType=`; the explorer has no chain or
 * oracle-type dimension in its URLs and instead resolves a request by
 * searching its index for the transaction hash, then disambiguating with
 * `eventIndex`, which it matches against the request / proposal / dispute /
 * settle events recorded on each request round.
 */
export const explorerBaseUrl = "https://explorer.uma.xyz";

/**
 * The explorer indexes Polygon mainnet only, and has no testnet deployment.
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

/** Whether the explorer has a page for this request. */
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

/** Which dapp an already-built request link points at, so the UI can label it. */
export function isExplorerRequestLink(href: string | undefined): boolean {
  return href?.startsWith(`${explorerBaseUrl}/`) ?? false;
}

function isSupportedChainId(chainId: string | number | undefined): boolean {
  if (chainId === undefined) return false;
  return chainId in supportedChains;
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
  // The explorer only needs eventIndex to disambiguate a transaction that
  // produced more than one request round; it resolves a single-request
  // transaction without it.
  if (eventIndex !== undefined && eventIndex !== "") {
    params.set("eventIndex", eventIndex);
  }

  return `${explorerBaseUrl}/requests?${params.toString()}`;
}

export function castOracleNameForOOUi(oracleType: string): string {
  switch (oracleType) {
    case "OptimisticOracle":
      return "Optimistic";
    case "OptimisticOracleV2":
      return "OptimisticV2";
    case "SkinnyOptimisticOracle":
      return "Skinny";
    case "OptimisticOracleV3":
      return "OptimisticV3";
    case "ManagedOptimisticOracleV2":
      return "ManagedV2";
    default:
      throw new Error("Unable to cast oracle name for OO UI: " + oracleType);
  }
}

export function constructOracleDappRequestLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined,
  eventIndex?: string | undefined,
  isTestnet = false
): string | undefined {
  if (!txHash || !chainId || !oracleType) return;
  if (!isSupportedChainId(chainId)) return;
  const subDomain = isTestnet ? "testnet." : "";
  return `https://${subDomain}oracle.uma.xyz/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${castOracleNameForOOUi(
    oracleType
  )}&eventIndex=${eventIndex ?? ""}`;
}

/**
 * Explorer link where the explorer serves the request, otherwise the oracle
 * dapp link that shipped before it.
 */
export function buildRequestLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined,
  eventIndex?: string | undefined,
  isTestnet = false
): string | undefined {
  return (
    constructExplorerRequestLink(txHash, chainId, oracleType, eventIndex) ??
    constructOracleDappRequestLink(
      txHash,
      chainId,
      oracleType,
      eventIndex,
      isTestnet
    )
  );
}
