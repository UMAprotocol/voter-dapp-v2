import * as ss from "superstruct";

// we want to create a raw type for the env, so we can alert the developer immediately when something does not exist
// and give them information as to which env was missing. We don't want the app to run without required variables.
// This would also be a great place to document what each env does and how to find it.
const Env = ss.object({
  NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_GRAPH_ENDPOINT_V1: ss.string(),
  NEXT_PUBLIC_GRAPH_ENDPOINT: ss.string(),
  NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS: ss.string(),
  NEXT_PUBLIC_BLOCKNATIVE_DAPP_ID: ss.string(),
  NEXT_PUBLIC_THE_GRAPH_API_KEY: ss.string(),
  NEXT_PUBLIC_INFURA_ID: ss.string(),
  NEXT_PUBLIC_ONBOARD_API_KEY: ss.string(),
  NEXT_PUBLIC_CURRENT_ENV: ss.string(),
  NEXT_PUBLIC_CONTENTFUL_SPACE_ID: ss.string(),
  NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN: ss.string(),
  // optional envs
  NEXT_PUBLIC_DEPLOY_BLOCK: ss.optional(ss.string()),
  NEXT_PUBLIC_SIGNING_MESSAGE: ss.optional(ss.string()),
  NEXT_PUBLIC_CHAIN_ID: ss.optional(ss.string()),
});
export type Env = ss.Infer<typeof Env>;

// this is the only way to get the frontend to copy env vars into the build, by explicitly naming them if this wasnt
// the case, we could just check process.env directly, but that wont work on the front end.
export const env = ss.create(
  {
    NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_VOTING_V1_CONTRACT_ADDRESS,
    NEXT_PUBLIC_GRAPH_ENDPOINT_V1: process.env.NEXT_PUBLIC_GRAPH_ENDPOINT_V1,
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
    NEXT_PUBLIC_CONTENTFUL_SPACE_ID:
      process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
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
  space: ss.string(),
  accessToken: ss.string(),
  blocknativeDappId: ss.string(),
  graphEndpointV1: ss.string(),
  graphEndpoint: ss.string(),
  signingMessage: ss.string(),
  deployBlock: ss.number(),
  chainId: ss.number(),
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
    space: env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
    accessToken: env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN,
    graphEndpointV1: env.NEXT_PUBLIC_GRAPH_ENDPOINT_V1,
    graphEndpoint: env.NEXT_PUBLIC_GRAPH_ENDPOINT,
    signingMessage:
      env.NEXT_PUBLIC_SIGNING_MESSAGE ?? "Login to UMA Voter dApp",
    deployBlock: Number(env.NEXT_PUBLIC_DEPLOY_BLOCK ?? "0"),
    chainId: Number(env.NEXT_PUBLIC_CHAIN_ID ?? "1"),
  },
  AppConfig
);

export type ChainConstants = {
  chainId: number;
  infuraName: string;
  properName: string;
  makeTransactionHashLink: (transactionHash: string) => string;
  onboardConfig: {
    id: string;
    token: string;
    label: string;
    rpcUrl: string;
  };
};
export type ChainConstantsList = ChainConstants[];

export const chainConstantsList: ChainConstantsList = [
  {
    chainId: 1,
    infuraName: "homestead",
    properName: "Mainnet",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://etherscan.io/tx/${transactionHash}`,
    onboardConfig: {
      id: "0x1",
      token: "ETH",
      label: "Ethereum",
      rpcUrl: `https://mainnet.infura.io/v3/${appConfig.infuraId}`,
    },
  },
  {
    chainId: 5,
    infuraName: "goerli",
    properName: "Görli",
    makeTransactionHashLink: (transactionHash: string) =>
      `https://goerli.etherscan.io/tx/${transactionHash}`,
    onboardConfig: {
      id: "0x5",
      token: "GOR",
      label: "Görli",
      rpcUrl: `https://goerli.infura.io/v3/${appConfig.infuraId}`,
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

export const config: ChainConstants & AppConfig = {
  ...chainConstants,
  ...appConfig,
};
