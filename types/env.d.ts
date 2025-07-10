export {}; // ensure this file is a module

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS?: string;
      NEXT_PUBLIC_VOTING_TOKEN_CONTRACT_ADDRESS?: string;
      NEXT_PUBLIC_INFURA_ID?: string;
      NEXT_PUBLIC_GRAPH_ENDPOINT?: string;
      NEXT_PUBLIC_PONDER_ENDPOINT?: string;
      // add additional env vars as needed
    }
  }
}