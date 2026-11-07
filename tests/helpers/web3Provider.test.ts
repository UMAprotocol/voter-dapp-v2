import { ethers } from "ethers";
import { Web3Provider } from "helpers/web3/provider";
import { describe, expect, it } from "vitest";

const from = `0x${"11".repeat(20)}`;
const to = `0x${"22".repeat(20)}`;
const hash = `0x${"ab".repeat(32)}`;
const notFound = Object.assign(new Error("Internal JSON-RPC error."), {
  code: -32603,
  data: { code: -32000, message: "transaction not found" },
});

// A wallet RPC that errors on lookups until the transaction is mined, and on
// receipts for two blocks after.
function wallet(
  minedAtBlock: number,
  lookupError: Error = notFound,
  Provider = Web3Provider
) {
  let block = 100;
  const minedAt = block + minedAtBlock;
  const mined = () => block >= minedAt;
  const request = ({ method }: { method: string }) => {
    switch (method) {
      case "eth_chainId":
        return Promise.resolve("0x1");
      case "eth_blockNumber":
        return Promise.resolve(ethers.utils.hexValue(++block));
      case "eth_accounts":
        return Promise.resolve([from]);
      case "eth_sendTransaction":
        return Promise.resolve(hash);
      case "eth_getTransactionCount":
        return Promise.resolve(mined() ? "0x1" : "0x0");
      case "eth_getTransactionByHash":
        if (!mined()) return Promise.reject(lookupError);
        return Promise.resolve({
          hash,
          blockHash: `0x${"cd".repeat(32)}`,
          blockNumber: ethers.utils.hexValue(minedAt),
          transactionIndex: "0x0",
          from,
          to,
          gas: "0x5208",
          gasPrice: "0x1",
          nonce: "0x0",
          input: "0x",
          value: "0x0",
          r: `0x${"01".repeat(32)}`,
          s: `0x${"02".repeat(32)}`,
          v: "0x25",
          type: "0x0",
        });
      case "eth_getTransactionReceipt":
        if (block < minedAt + 2) return Promise.reject(lookupError);
        return Promise.resolve({
          transactionHash: hash,
          blockHash: `0x${"cd".repeat(32)}`,
          blockNumber: ethers.utils.hexValue(minedAt),
          transactionIndex: "0x0",
          from,
          to,
          contractAddress: null,
          cumulativeGasUsed: "0x5208",
          gasUsed: "0x5208",
          effectiveGasPrice: "0x1",
          logs: [],
          logsBloom: `0x${"00".repeat(256)}`,
          status: "0x1",
          type: "0x0",
        });
    }
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const provider = new Provider({ request }, 1);
  provider.pollingInterval = 10;
  return provider;
}

async function sendAndWait(provider: ethers.providers.Web3Provider) {
  const tx = await provider
    .getSigner()
    .sendTransaction({ to, gasLimit: 21000, gasPrice: 1, nonce: 0 });
  return tx.wait();
}

describe("Web3Provider", () => {
  it("waits across blocks while the transaction is not found", async () => {
    const stock = wallet(3, notFound, ethers.providers.Web3Provider);
    await expect(sendAndWait(stock)).rejects.toBe(notFound);
    const receipt = await sendAndWait(wallet(3));
    expect(receipt.transactionHash).toBe(hash);
    expect(receipt.status).toBe(1);
  });

  it("still fails on other lookup errors", async () => {
    const error = Object.assign(new Error("Method not found"), {
      code: -32601,
    });
    await expect(sendAndWait(wallet(3, error))).rejects.toBe(error);
  });
});
