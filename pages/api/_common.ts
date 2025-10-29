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
  1, 5, 10, 100, 137, 288, 416, 8453, 11155111, 1116, 42161, 43114, 80001,
  80002, 81457,
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
const Env = ss.object({
  SUBGRAPH_V1_1: ss.optional(ss.string()),
  SUBGRAPH_V2_1: ss.optional(ss.string()),
  SUBGRAPH_V3_1: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_1: ss.optional(ss.string()),

  SUBGRAPH_V1_10: ss.optional(ss.string()),
  SUBGRAPH_V2_10: ss.optional(ss.string()),
  SUBGRAPH_V3_10: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_10: ss.optional(ss.string()),

  SUBGRAPH_V1_137: ss.optional(ss.string()),
  SUBGRAPH_V2_137: ss.optional(ss.string()),
  SUBGRAPH_V3_137: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_137: ss.optional(ss.string()),
  SUBGRAPH_MANAGED_137: ss.optional(ss.string()),

  SUBGRAPH_V1_5: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_5: ss.optional(ss.string()),
  SUBGRAPH_V3_5: ss.optional(ss.string()),
  SUBGRAPH_V2_5: ss.optional(ss.string()),

  SUBGRAPH_V1_1116: ss.optional(ss.string()),
  SUBGRAPH_V2_1116: ss.optional(ss.string()),
  SUBGRAPH_V3_1116: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_1116: ss.optional(ss.string()),

  SUBGRAPH_V1_1514: ss.optional(ss.string()),
  SUBGRAPH_V2_1514: ss.optional(ss.string()),
  SUBGRAPH_V3_1514: ss.optional(ss.string()),

  SUBGRAPH_V1_80002: ss.optional(ss.string()),
  SUBGRAPH_V2_80002: ss.optional(ss.string()),
  SUBGRAPH_V3_80002: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_80002: ss.optional(ss.string()),
  SUBGRAPH_MANAGED_80002: ss.optional(ss.string()),

  SUBGRAPH_V1_81457: ss.optional(ss.string()),
  SUBGRAPH_V2_81457: ss.optional(ss.string()),
  SUBGRAPH_V3_81457: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_81457: ss.optional(ss.string()),

  SUBGRAPH_V2_11155111: ss.optional(ss.string()),
  SUBGRAPH_V3_11155111: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_11155111: ss.optional(ss.string()),
  SUBGRAPH_V1_11155111: ss.optional(ss.string()),

  SUBGRAPH_V1_288: ss.optional(ss.string()),
  SUBGRAPH_V2_288: ss.optional(ss.string()),
  SUBGRAPH_V3_288: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_288: ss.optional(ss.string()),

  SUBGRAPH_V1_42161: ss.optional(ss.string()),
  SUBGRAPH_V2_42161: ss.optional(ss.string()),
  SUBGRAPH_V3_42161: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_42161: ss.optional(ss.string()),

  SUBGRAPH_V2_80001: ss.optional(ss.string()),
  SUBGRAPH_V1_80001: ss.optional(ss.string()),
  SUBGRAPH_V3_80001: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_80001: ss.optional(ss.string()),

  SUBGRAPH_V1_8453: ss.optional(ss.string()),
  SUBGRAPH_V2_8453: ss.optional(ss.string()),
  SUBGRAPH_V3_8453: ss.optional(ss.string()),
  SUBGRAPH_SKINNY_8453: ss.optional(ss.string()),
});
export type Env = ss.Infer<typeof Env>;

// every prop of next envs needs to be explicitly pulled in
const env = ss.create(
  {
    SUBGRAPH_V1_1: process.env.SUBGRAPH_V1_1,
    SUBGRAPH_V1_5: process.env.SUBGRAPH_V1_5,
    SUBGRAPH_V1_10: process.env.SUBGRAPH_V1_10,
    SUBGRAPH_V1_137: process.env.SUBGRAPH_V1_137,
    SUBGRAPH_V1_288: process.env.SUBGRAPH_V1_288,
    SUBGRAPH_V1_1116: process.env.SUBGRAPH_V1_1116,
    SUBGRAPH_V1_1514: process.env.SUBGRAPH_V1_1514,
    SUBGRAPH_V1_42161: process.env.SUBGRAPH_V1_42161,
    SUBGRAPH_V1_80001: process.env.SUBGRAPH_V1_80001,
    SUBGRAPH_V1_80002: process.env.SUBGRAPH_V1_80002,
    SUBGRAPH_V1_81457: process.env.SUBGRAPH_V1_81457,
    SUBGRAPH_V1_11155111: process.env.SUBGRAPH_V1_11155111,

    SUBGRAPH_V2_1: process.env.SUBGRAPH_V2_1,
    SUBGRAPH_V2_5: process.env.SUBGRAPH_V2_5,
    SUBGRAPH_V2_10: process.env.SUBGRAPH_V2_10,
    SUBGRAPH_V2_137: process.env.SUBGRAPH_V2_137,
    SUBGRAPH_V2_288: process.env.SUBGRAPH_V2_288,
    SUBGRAPH_V2_1116: process.env.SUBGRAPH_V2_1116,
    SUBGRAPH_V2_1514: process.env.SUBGRAPH_V2_1514,
    SUBGRAPH_V2_42161: process.env.SUBGRAPH_V2_42161,
    SUBGRAPH_V2_80001: process.env.SUBGRAPH_V2_80001,
    SUBGRAPH_V2_80002: process.env.SUBGRAPH_V2_80002,
    SUBGRAPH_V2_81457: process.env.SUBGRAPH_V2_81457,
    SUBGRAPH_V2_11155111: process.env.SUBGRAPH_V2_11155111,

    SUBGRAPH_V3_1: process.env.SUBGRAPH_V3_1,
    SUBGRAPH_V3_5: process.env.SUBGRAPH_V3_5,
    SUBGRAPH_V3_10: process.env.SUBGRAPH_V3_10,
    SUBGRAPH_V3_137: process.env.SUBGRAPH_V3_137,
    SUBGRAPH_V3_288: process.env.SUBGRAPH_V3_288,
    SUBGRAPH_V3_1116: process.env.SUBGRAPH_V3_1116,
    SUBGRAPH_V3_1514: process.env.SUBGRAPH_V3_1514,
    SUBGRAPH_V3_42161: process.env.SUBGRAPH_V3_42161,
    SUBGRAPH_V3_80001: process.env.SUBGRAPH_V3_80001,
    SUBGRAPH_V3_80002: process.env.SUBGRAPH_V3_80002,
    SUBGRAPH_V3_81457: process.env.SUBGRAPH_V3_81457,
    SUBGRAPH_V3_11155111: process.env.SUBGRAPH_V3_11155111,

    SUBGRAPH_SKINNY_1: process.env.SUBGRAPH_SKINNY_1,
    SUBGRAPH_SKINNY_10: process.env.SUBGRAPH_SKINNY_10,
    SUBGRAPH_SKINNY_137: process.env.SUBGRAPH_SKINNY_137,
    SUBGRAPH_SKINNY_288: process.env.SUBGRAPH_SKINNY_288,
    SUBGRAPH_SKINNY_1116: process.env.SUBGRAPH_SKINNY_1116,
    SUBGRAPH_SKINNY_42161: process.env.SUBGRAPH_SKINNY_42161,
    SUBGRAPH_SKINNY_5: process.env.SUBGRAPH_SKINNY_5,
    SUBGRAPH_SKINNY_80001: process.env.SUBGRAPH_SKINNY_80001,
    SUBGRAPH_SKINNY_80002: process.env.SUBGRAPH_SKINNY_80002,
    SUBGRAPH_SKINNY_81457: process.env.SUBGRAPH_SKINNY_81457,
    SUBGRAPH_SKINNY_11155111: process.env.SUBGRAPH_SKINNY_11155111,

    SUBGRAPH_MANAGED_137: process.env.SUBGRAPH_MANAGED_137,
    SUBGRAPH_MANAGED_80002: process.env.SUBGRAPH_MANAGED_80002,

    SUBGRAPH_V1_8453: process.env.SUBGRAPH_V1_8453,
    SUBGRAPH_V2_8453: process.env.SUBGRAPH_V2_8453,
    SUBGRAPH_V3_8453: process.env.SUBGRAPH_V3_8453,
    SUBGRAPH_SKINNY_8453: process.env.SUBGRAPH_SKINNY_8453,
  },
  Env
);

export function parseSubgraphEnv(env: Env): SubgraphConfigs {
  const subgraphs: SubgraphConfigs = [];

  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    const [type, version, chainId] = key.split("_");
    if (type === "SUBGRAPH") {
      if (version === "SKINNY") {
        const subgraph = {
          source: "gql",
          url: value,
          type: "Skinny Optimistic Oracle",
          chainId: parseInt(chainId),
        };
        if (ss.is(subgraph, SubgraphConfig)) {
          subgraphs.push(subgraph);
        }
      } else if (version === "MANAGED") {
        const subgraph = {
          source: "gql",
          url: value,
          type: "Managed Optimistic Oracle V2",
          chainId: parseInt(chainId),
        };
        if (ss.is(subgraph, SubgraphConfig)) {
          subgraphs.push(subgraph);
        }
      } else {
        const subgraph = {
          source: "gql",
          url: value,
          type: `Optimistic Oracle ${version}`,
          chainId: parseInt(chainId),
        };
        if (ss.is(subgraph, SubgraphConfig)) {
          subgraphs.push(subgraph);
        }
      }
    }
  }
  return subgraphs;
}

export const subgraphConfigs = parseSubgraphEnv(env);

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
