// @ts-nocheck
import { defineConfig } from "ponder";
// We import the VotingV2 ABI directly from the UMA contracts package. If the path changes, update accordingly.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VotingV2Abi from "@uma/contracts-node/artifacts/contracts/VotingV2.sol/VotingV2.json";

export default defineConfig({
  // Index mainnet by default. Additional chains can be configured by adding
  // more entries to the `networks` object and providing RPC URLs via env vars
  networks: {
    mainnet: {
      chainId: 1,
      // Point to any mainnet RPC. Typically you will provide this via an env var like
      //  PONDER_RPC_URL_1=https://mainnet.infura.io/v3/<key>
      rpcUrl: process.env.PONDER_RPC_URL_1 ?? "",
    },
  },
  contracts: {
    VotingV2: {
      network: "mainnet",
      abi: VotingV2Abi.abi ?? VotingV2Abi,
      // NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS is already required by the front-end so we reuse it here.
      address: process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS as `0x${string}`,
      // You can start indexing from the VotingV2 deployment block to speed things up.
      // Override with PONDER_START_BLOCK if you know a more accurate value.
      startBlock: Number(process.env.PONDER_START_BLOCK ?? "0"),
    },
  },
});