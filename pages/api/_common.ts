import { getAbi, getAddress } from "@uma/contracts-node";
import { Contract, ethers } from "ethers";
import { NodeUrls, SupportedChainIds } from "types";
import { supportedChains } from "constant";
import * as ss from "superstruct";
import { getContractLocal, LocalContract } from "./_contracts";
import { config } from "helpers";

export const VoteSubgraphURL: string = ss.create(
  process.env.NEXT_PUBLIC_GRAPH_ENDPOINT,
  ss.string()
);

type GetAddressParams = Parameters<typeof getAddress>;

type GetAbiParams = Parameters<typeof getAbi>;

export type ContractName = GetAddressParams[0] & GetAbiParams[0];

export function getProviderByChainId(chainId: SupportedChainIds) {
  return new ethers.providers.JsonRpcBatchProvider(getNodeUrls()[chainId]);
}

export function getNodeUrls() {
  if (!process.env.NODE_URLS) throw Error("NODE_URLS env variable not set!");
  return JSON.parse(process.env.NODE_URLS) as NodeUrls;
}

export async function constructContractFromLib(
  chainId: SupportedChainIds,
  contractName: ContractName
) {
  return new Contract(
    await getAddress(contractName, chainId),
    getAbi(contractName),
    getProviderByChainId(chainId)
  );
}

export function constructContractFromLocal(
  chainId: SupportedChainIds,
  contractName: ContractName | LocalContract["type"]
) {
  const localContractDetails = getContractLocal(chainId, contractName);
  if (localContractDetails) {
    return new Contract(
      localContractDetails.address,
      localContractDetails.abi,
      getProviderByChainId(chainId)
    );
  }
}

export async function constructContract(
  chainId: SupportedChainIds,
  contractName: ContractName | LocalContract["type"]
) {
  const local = constructContractFromLocal(chainId, contractName);
  if (!local) {
    return await constructContractFromLib(
      chainId,
      contractName as ContractName
    );
  }
  throw new Error(
    `Unable to find contract ${contractName} on chain ${chainId}`
  );
}

export function isSupportedChainId(
  chainId: string | number | undefined
): chainId is SupportedChainIds {
  if (chainId === undefined) return false;
  return chainId in supportedChains;
}

// add block start times here, perhaps we can allow this to be configured through environment variables eventually.
// this is used for augmented request events and can be used in other places as well to optimize event calls.
export const fromBlocks: Record<string, Record<number | string, number>> = {
  OptimisticOracle: {
    1: 0,
    5: 0,
    11155111: 5421122,
  },
  OptimisticOracleV2: {
    1: 0,
    5: 0,
    11155111: 5421127,
  },
  SkinnyOptimisticOracle: {
    1: 0,
    5: 0,
    11155111: 5421124,
  },
  VotingV2: {
    1: 0,
    5: 0,
    11155111: 5421133,
  },
  Voting: {
    1: 0,
    5: 0,
    11155111: 5427310,
  },
  ManagedOptimisticOracleV2: {
    137: 74677419,
    80002: 24737019,
  },
};
export const ChainId = ss.enums([
  1, 5, 10, 137, 288, 416, 8453, 11155111, 42161, 80001, 80002, 81457,
]);

export function getFromBlock(
  oracleType: string,
  chainId: number,
  fallbackFromBlock = 0
): number {
  return fromBlocks?.[oracleType]?.[chainId] || fallbackFromBlock;
}

const SubgraphConfig = ss.object({
  source: ss.literal("gql"),
  url: ss.string(),
  type: ss.enums([
    "Optimistic Oracle V1",
    "Optimistic Oracle V2",
    "Optimistic Oracle V3",
    "Skinny Optimistic Oracle",
    "Managed Optimistic Oracle V2",
  ]),
  chainId: ChainId,
});

export type SubgraphConfig = ss.Infer<typeof SubgraphConfig>;
const SubgraphConfigs = ss.array(SubgraphConfig);
export type SubgraphConfigs = ss.Infer<typeof SubgraphConfigs>;
// SUBGRAPH_* vars are only read server-side, so unlike NEXT_PUBLIC_* vars they
// don't need to be enumerated for build-time inlining — scan process.env for
// keys matching the pattern instead. Adding a chain is env-only, no code change.
const SUBGRAPH_KEY_PATTERN = /^SUBGRAPH_(V1|V2|V3|SKINNY|MANAGED)_\d+$/;

export function parseSubgraphEnv(
  env: Record<string, string | undefined>
): SubgraphConfigs {
  const subgraphs: SubgraphConfigs = [];

  for (const [key, value] of Object.entries(env)) {
    if (!value || !SUBGRAPH_KEY_PATTERN.test(key)) continue;
    const [, version, chainId] = key.split("_");
    const type =
      version === "SKINNY"
        ? "Skinny Optimistic Oracle"
        : version === "MANAGED"
        ? "Managed Optimistic Oracle V2"
        : `Optimistic Oracle ${version}`;
    const subgraph = {
      source: "gql",
      url: value,
      type,
      chainId: parseInt(chainId),
    };
    if (ss.is(subgraph, SubgraphConfig)) {
      subgraphs.push(subgraph);
    }
  }
  return subgraphs;
}

export const subgraphConfigs = parseSubgraphEnv(process.env);

export function getSubgraphConfig(
  type: string,
  chainId: number
): SubgraphConfig {
  const found = subgraphConfigs.find(
    (config) => config.chainId === chainId && config.type === type
  );
  if (found !== undefined) return found;
  throw new Error(
    `No subgraph information found for ${type} on chainId ${chainId}`
  );
}

export function constructOoUiLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined,
  eventIndex?: string | undefined
) {
  if (!txHash || !chainId || !oracleType) return;
  if (!isSupportedChainId(chainId)) return;
  const subDomain = config.isTestnet ? "testnet." : "";
  return `https://${subDomain}oracle.uma.xyz/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${castOracleNameForOOUi(
    oracleType
  )}&eventIndex=${eventIndex ?? ""}`;
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
