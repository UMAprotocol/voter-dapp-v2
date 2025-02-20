import { getDesignatedVotingFactoryAddress } from "@uma/contracts-frontend";
import * as ss from "superstruct";
import { SupportedChainIds } from "types";

// we want to create a raw type for the env, so we can alert the developer immediately when something does not exist
// and give them information as to which env was missing. We don't want the app to run without required variables.
// This would also be a great place to document what each env does and how to find it.
const Env = ss.object({
  NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID: ss.string(),
  NEXT_PUBLIC_INFURA_ID: ss.string(),
  NEXT_PUBLIC_ONBOARD_API_KEY: ss.string(),
  NEXT_PUBLIC_CURRENT_ENV: ss.string(),
  NEXT_PUBLIC_WALLET_CONNECT: ss.string(),
  NEXT_PUBLIC_GRAPH_STUDIO_API_KEY: ss.string(),
  // optional envs
  NEXT_PUBLIC_CONTENTFUL_SPACE_ID: ss.optional(ss.string()),
  NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: ss.optional(ss.string()),
  NEXT_PUBLIC_THE_GRAPH_API_KEY: ss.optional(ss.string()),
  NEXT_PUBLIC_GRAPH_ENDPOINT: ss.optional(ss.string()),
  NEXT_PUBLIC_DEPLOY_BLOCK: ss.optional(ss.string()),
  NEXT_PUBLIC_SIGNING_MESSAGE: ss.optional(ss.string()),
  NEXT_PUBLIC_CHAIN_ID: ss.optional(ss.string()),
  NEXT_PUBLIC_OVERRIDE_APR: ss.optional(ss.string()),
  NEXT_PUBLIC_DESIGNATED_VOTING_FACTORY_V1_ADDRESS: ss.optional(ss.string()),
  NEXT_PUBLIC_PHASE_LENGTH: ss.optional(ss.string()),
  NEXT_PUBLIC_MAILCHIMP_URL: ss.optional(ss.string()),
  NEXT_PUBLIC_MAILCHIMP_TAGS: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_1: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_5: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_10: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_137: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_288: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_1514: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_8453: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_42161: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_81457: ss.optional(ss.string()),
  NEXT_PUBLIC_PROVIDER_V3_11155111: ss.optional(ss.string()),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG: ss.optional(ss.string()),
});
export type Env = ss.Infer<typeof Env>;

// this is the only way to get the frontend to copy env vars into the build, by explicitly naming them if this wasnt
// the case, we could just check process.env directly, but that wont work on the front end.
export const env = ss.create(
  {
    NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS,
    NEXT_PUBLIC_SIGNING_MESSAGE: process.env.NEXT_PUBLIC_SIGNING_MESSAGE,
    NEXT_PUBLIC_GRAPH_ENDPOINT: process.env.NEXT_PUBLIC_GRAPH_ENDPOINT,
    NEXT_PUBLIC_DEPLOY_BLOCK: process.env.NEXT_PUBLIC_DEPLOY_BLOCK,
    NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS,
    NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
    NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID:
      process.env.NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID,
    NEXT_PUBLIC_THE_GRAPH_API_KEY: process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY,
    NEXT_PUBLIC_INFURA_ID: process.env.NEXT_PUBLIC_INFURA_ID,
    NEXT_PUBLIC_ONBOARD_API_KEY: process.env.NEXT_PUBLIC_ONBOARD_API_KEY,
    NEXT_PUBLIC_CURRENT_ENV: process.env.NEXT_PUBLIC_CURRENT_ENV,
    NEXT_PUBLIC_WALLET_CONNECT: process.env.NEXT_PUBLIC_WALLET_CONNECT,
    NEXT_PUBLIC_CONTENTFUL_SPACE_ID:
      process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_OVERRIDE_APR: process.env.NEXT_PUBLIC_OVERRIDE_APR,
    NEXT_PUBLIC_DESIGNATED_VOTING_FACTORY_V1_ADDRESS:
      process.env.NEXT_PUBLIC_DESIGNATED_VOTING_FACTORY_V1_ADDRESS,
    NEXT_PUBLIC_PHASE_LENGTH: process.env.NEXT_PUBLIC_PHASE_LENGTH,
    NEXT_PUBLIC_MAILCHIMP_URL: process.env.NEXT_PUBLIC_MAILCHIMP_URL,
    NEXT_PUBLIC_MAILCHIMP_TAGS: process.env.NEXT_PUBLIC_MAILCHIMP_TAGS,
    NEXT_PUBLIC_GRAPH_STUDIO_API_KEY:
      process.env.NEXT_PUBLIC_GRAPH_STUDIO_API_KEY,
    NEXT_PUBLIC_PROVIDER_V3_1: process.env.NEXT_PUBLIC_PROVIDER_V3_1,
    NEXT_PUBLIC_PROVIDER_V3_137: process.env.NEXT_PUBLIC_PROVIDER_V3_137,
    NEXT_PUBLIC_PROVIDER_V3_288: process.env.NEXT_PUBLIC_PROVIDER_V3_288,
    NEXT_PUBLIC_PROVIDER_V3_42161: process.env.NEXT_PUBLIC_PROVIDER_V3_42161,
    NEXT_PUBLIC_PROVIDER_V3_5: process.env.NEXT_PUBLIC_PROVIDER_V3_5,
    NEXT_PUBLIC_PROVIDER_V3_10: process.env.NEXT_PUBLIC_PROVIDER_V3_10,
    NEXT_PUBLIC_PROVIDER_V3_11155111:
      process.env.NEXT_PUBLIC_PROVIDER_V3_11155111,
    NEXT_PUBLIC_PROVIDER_V3_8453: process.env.NEXT_PUBLIC_PROVIDER_V3_8453,
    NEXT_PUBLIC_PROVIDER_V3_81457: process.env.NEXT_PUBLIC_PROVIDER_V3_81457,
    NEXT_PUBLIC_PROVIDER_V3_1514: process.env.NEXT_PUBLIC_PROVIDER_V3_1514,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG:
      process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG,
  },
  Env
);
// we want to create a configuration type which the app can references to easily get constants and other data.
// This is the object the rest of the app should be referencing, not pulling raw environment vars through the app.
const AppConfig = ss.object({
  infuraId: ss.string(),
  votingContractAddress: ss.string(),
  votingTokenContractAddress: ss.string(),
  votingV1ContractAddress: ss.string(),
  blocknativeDappId: ss.string(),
  signingMessage: ss.string(),
  deployBlock: ss.number(),
  chainId: ss.number(),
  walletConnectProjectId: ss.string(),
  gaTag: ss.string(),
  graphStudioApiKey: ss.string(),
  graphEndpointV1: ss.optional(ss.string()),
  graphEndpoint: ss.optional(ss.string()),
  contentfulSpace: ss.optional(ss.string()),
  contentfulAccessToken: ss.optional(ss.string()),
  graphV2Enabled: ss.defaulted(ss.boolean(), false),
  contentfulEnabled: ss.defaulted(ss.boolean(), false),
  overrideApr: ss.optional(ss.string()),
  designatedVotingFactoryV1Address: ss.string(),
  phaseLength: ss.number(),
  mailchimpUrl: ss.optional(ss.string()),
  mailchimpTags: ss.optional(ss.string()),
  oov3ProviderUrl1: ss.optional(ss.string()),
  oov3ProviderUrl137: ss.optional(ss.string()),
  oov3ProviderUrl288: ss.optional(ss.string()),
  oov3ProviderUrl1514: ss.optional(ss.string()),
  oov3ProviderUrl42161: ss.optional(ss.string()),
  oov3ProviderUrl5: ss.optional(ss.string()),
  oov3ProviderUrl10: ss.optional(ss.string()),
  oov3ProviderUrl11155111: ss.optional(ss.string()),
  oov3ProviderUrl8453: ss.optional(ss.string()),
  oov3ProviderUrl81457: ss.optional(ss.string()),
});
export type AppConfig = ss.Infer<typeof AppConfig>;

// copying the environment variables into the config and parsing them. Its true we could forgo an explicit type check of process.env
// and just do it here, but its more clear to the developer when the error matches the env name they needed to supply,
// rather than this object where the names are converted to something more consumable in the rest of the code base and
// not necessarily the same as whats defined in the env.
export const appConfig = ss.create(
  {
    blocknativeDappId: env.NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID,
    infuraId: env.NEXT_PUBLIC_INFURA_ID,
    votingContractAddress: env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS,
    votingTokenContractAddress: env.NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS,
    votingV1ContractAddress: env.NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS,
    contentfulSpace: env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    contentfulAccessToken: env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    graphEndpoint: env.NEXT_PUBLIC_GRAPH_ENDPOINT,
    signingMessage:
      env.NEXT_PUBLIC_SIGNING_MESSAGE ?? "Login to UMA Voter dApp",
    deployBlock: Number(env.NEXT_PUBLIC_DEPLOY_BLOCK ?? "0"),
    chainId: Number(env.NEXT_PUBLIC_CHAIN_ID ?? "1"),
    walletConnectProjectId: env.NEXT_PUBLIC_WALLET_CONNECT,
    graphV2Enabled: !!env.NEXT_PUBLIC_GRAPH_ENDPOINT,
    contentfulEnabled:
      !!env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN &&
      !!env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    overrideApr: env.NEXT_PUBLIC_OVERRIDE_APR,
    designatedVotingFactoryV1Address:
      env.NEXT_PUBLIC_DESIGNATED_VOTING_FACTORY_V1_ADDRESS ??
      getDesignatedVotingFactoryAddress(
        Number(env.NEXT_PUBLIC_CHAIN_ID ?? "1")
      ),
    phaseLength: Number(env.NEXT_PUBLIC_PHASE_LENGTH || 86400),
    mailchimpUrl: env.NEXT_PUBLIC_MAILCHIMP_URL,
    mailchimpTags: env.NEXT_PUBLIC_MAILCHIMP_TAGS,
    graphStudioApiKey: env.NEXT_PUBLIC_GRAPH_STUDIO_API_KEY,
    oov3ProviderUrl1: process.env.NEXT_PUBLIC_PROVIDER_V3_1,
    oov3ProviderUrl137: process.env.NEXT_PUBLIC_PROVIDER_V3_137,
    oov3ProviderUrl288: process.env.NEXT_PUBLIC_PROVIDER_V3_288,
    oov3ProviderUrl1514: process.env.NEXT_PUBLIC_PROVIDER_V3_1514,
    oov3ProviderUrl42161: process.env.NEXT_PUBLIC_PROVIDER_V3_42161,
    oov3ProviderUrl5: process.env.NEXT_PUBLIC_PROVIDER_V3_5,
    oov3ProviderUrl10: process.env.NEXT_PUBLIC_PROVIDER_V3_10,
    oov3ProviderUrl11155111: process.env.NEXT_PUBLIC_PROVIDER_V3_11155111,
    oov3ProviderUrl8453: process.env.NEXT_PUBLIC_PROVIDER_V3_8453,
    oov3ProviderUrl81457: process.env.NEXT_PUBLIC_PROVIDER_V3_81457,
    gaTag: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TAG,
  },
  AppConfig
);

export type ChainConstants = {
  chainId: SupportedChainIds;
  infuraName: string;
  properName: string;
  makeTransactionHashLink: (transactionHash: string) => string;
  makeAddressLink: (address: string) => string;
  onboardConfig: {
    id: string;
    token: string;
    label: string;
    rpcUrl: string;
  };
};
export type ChainConstantsList = ChainConstants[];

// we need to have information about other chains, not only to run as a primary chain, but
// in order to create links/assets for linking to other chains, which we need for some requests.
// if a chain in the UI isnt supported it probably needs to be added here first.
export const chainConstantsList: ChainConstantsList = [
  {
    chainId: 1,
    infuraName: "homestead",
    properName: "Ethereum",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://etherscan.io/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://etherscan.io/address/${address}`,
    onboardConfig: {
      id: "0x1",
      token: "ETH",
      label: "Ethereum",
      rpcUrl: appConfig.oov3ProviderUrl1 as string,
    },
  },
  {
    chainId: 137,
    infuraName: "Polygon",
    properName: "Polygon",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://polygonscan.com/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://polygonscan.etherscan.io/address/${address}`,
    // this may or may not work, but we shouldnt ever need to use this
    onboardConfig: {
      id: "0x137",
      token: "MATIC",
      label: "Polygon",
      rpcUrl: `https://polygon.infura.io/v3/${appConfig.infuraId}`,
    },
  },
  {
    chainId: 11155111,
    infuraName: "sepolia",
    properName: "Sepolia",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://sepolia.etherscan.io/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://sepolia.etherscan.io/address/${address}`,
    onboardConfig: {
      id: "0xaa36a7",
      token: "ETH",
      label: "SepoliaETH",
      rpcUrl: `https://sepolia.infura.io/v3/${appConfig.infuraId}`,
    },
  },
  {
    chainId: 8453,
    infuraName: "base",
    properName: "Base",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://basescan.org/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://basescan.org/address/${address}`,
    onboardConfig: {
      id: "0x2105",
      token: "ETH",
      label: "BaseETH",
      rpcUrl: "https://mainnet.base.org", // infura not supporting base yet
    },
  },
  {
    chainId: 81457,
    infuraName: "blast",
    properName: "Blast",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://blastscan.io/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://blastscan.io/address/${address}`,
    onboardConfig: {
      id: "0x13e31",
      token: "ETH",
      label: "BlastETH",
      rpcUrl: "https://rpc.blast.io", // infura not supporting blast yet
    },
  },
  {
    chainId: 1514,
    infuraName: "story",
    properName: "Story",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://storyscan.xyz/tx/${transactionHash}`,
    makeAddressLink: (address: string) =>
      `https://storyscan.xyz/address/${address}`,
    onboardConfig: {
      id: "0x5EA",
      token: "IP",
      label: "IP",
      rpcUrl: "https://mainnet.storyrpc.io",
    },
  },
];

export const chainConstants = chainConstantsList.find(
  ({ chainId }) => chainId === appConfig.chainId
);
if (chainConstants == undefined)
  throw new Error(
    `Unable to find chain constants for chain Id ${appConfig.chainId}`
  );

import { ethers } from "ethers";

export const config: AppConfig & ChainConstants = {
  ...appConfig,
  ...chainConstants,
};

// primary provider looks at what chainId we have specified as our primary chain,
// this is typically 1, but for testnetswe would use the testnet id
const providerUrlKey =
  `oov3ProviderUrl${config.chainId}` as keyof typeof config;
const providerUrl = config[providerUrlKey] as string | undefined;
if (!providerUrl) {
  throw new Error(`Provider URL not found for chain Id ${config.chainId}`);
}
export const primaryProvider = new ethers.providers.JsonRpcProvider(
  providerUrl
);
