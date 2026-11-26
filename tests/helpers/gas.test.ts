import { ethers } from "ethers";
import {
  getGasFeeOverrides,
  insufficientEthForGasMessage,
  sendWithGasCheck,
} from "helpers/gas";
import { Web3Provider } from "helpers/web3/provider";
import { describe, expect, it, vi } from "vitest";

const voter = `0x${"11".repeat(20)}`;
const votingAddress = `0x${"22".repeat(20)}`;
// A 38-vote commit on mainnet.
const gasNeeded = 3_369_060;
const baseFee = ethers.utils.parseUnits("1.35", "gwei");

// A wallet whose node, like geth and reth, caps a fee-bearing estimate at
// balance / maxFeePerGas.
function wallet(
  balance: ethers.BigNumber,
  {
    reverts = false,
    code = "0x",
    sendError = { code: 4001, message: "User denied transaction signature." },
  } = {}
) {
  const request = ({
    method,
    params = [],
  }: {
    method: string;
    params?: unknown[];
  }) => {
    switch (method) {
      case "eth_chainId":
        return Promise.resolve("0x1");
      case "eth_blockNumber":
        return Promise.resolve("0x64");
      case "eth_accounts":
        return Promise.resolve([voter]);
      case "eth_getBalance":
        return Promise.resolve(balance.toHexString());
      case "eth_getCode":
        return Promise.resolve(code);
      case "eth_getBlockByNumber":
        return Promise.resolve({
          number: "0x64",
          hash: `0x${"cd".repeat(32)}`,
          parentHash: `0x${"ab".repeat(32)}`,
          timestamp: "0x0",
          nonce: "0x0000000000000000",
          difficulty: "0x0",
          gasLimit: "0x2aea540",
          gasUsed: "0x0",
          miner: votingAddress,
          extraData: "0x",
          baseFeePerGas: baseFee.toHexString(),
          transactions: [],
        });
      case "eth_gasPrice":
        return Promise.resolve(baseFee.toHexString());
      case "eth_estimateGas": {
        if (reverts) {
          return Promise.reject({
            code: 3,
            message: "execution reverted: Cannot commit in reveal phase",
          });
        }
        const fee: unknown = Reflect.get(Object(params[0]), "maxFeePerGas");
        const allowance =
          typeof fee === "string"
            ? balance.div(fee)
            : ethers.constants.MaxUint256;
        if (allowance.lt(gasNeeded)) {
          return Promise.reject({
            code: -32000,
            message: `gas required exceeds allowance (${allowance.toString()})`,
          });
        }
        return Promise.resolve(ethers.utils.hexValue(gasNeeded));
      }
      case "eth_sendTransaction":
        return Promise.reject(sendError);
    }
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  return new Web3Provider({ request }, 1);
}

async function commit(
  balanceEth: string,
  options?: Parameters<typeof wallet>[1]
) {
  const provider = wallet(ethers.utils.parseEther(balanceEth), options);
  const signer = provider.getSigner();
  const voting = new ethers.Contract(
    votingAddress,
    ["function multicall(bytes[] data) returns (bytes[] results)"],
    signer
  );
  const gasOverrides = await getGasFeeOverrides(provider);
  return sendWithGasCheck({
    signer,
    gasOverrides,
    estimateGas: () => voting.estimateGas.multicall([]),
    send: () => voting.functions.multicall([], gasOverrides),
  });
}

describe("sendWithGasCheck", () => {
  it("says the wallet is short of ETH instead of 'cannot estimate gas'", async () => {
    // 3,369,060 gas * (1.35 * 1.5 + 0.001) gwei = 0.00682569 ETH
    await expect(commit("0.005")).rejects.toThrow(
      "Connected wallet does not have enough ETH for gas; estimated gas cost = 0.0069 ETH."
    );
    await expect(commit("0")).rejects.toThrow(
      "estimated gas cost = 0.0069 ETH"
    );
  });

  it("checks an EIP-7702 delegated EOA, which pays its own gas", async () => {
    await expect(
      commit("0.005", { code: `0xef0100${"33".repeat(20)}` })
    ).rejects.toThrow("estimated gas cost = 0.0069 ETH");
  });

  it("keeps the original error for a contract wallet such as a Safe", async () => {
    // The Safe's own balance doesn't pay for gas, so it says nothing.
    await expect(commit("0", { code: "0x6080604052" })).rejects.toMatchObject({
      code: "UNPREDICTABLE_GAS_LIMIT",
    });
  });

  it("keeps the original error when the wallet has enough ETH", async () => {
    const sendError = { code: -32603, message: "Internal JSON-RPC error." };
    await expect(commit("1", { sendError })).rejects.toBe(sendError);
  });

  it("passes a wallet's rejection through", async () => {
    await expect(commit("1")).rejects.toMatchObject({
      code: "ACTION_REJECTED",
    });
    // Not "user denied", so ethers keeps the wallet's own error.
    const sendError = { code: 4001, message: "User rejected the request." };
    await expect(commit("1", { sendError })).rejects.toBe(sendError);
  });

  it("keeps the original error when the call reverts", async () => {
    await expect(commit("0", { reverts: true })).rejects.toMatchObject({
      code: "UNPREDICTABLE_GAS_LIMIT",
    });
  });

  it("only checks after a failed send with a fee override", async () => {
    const estimateGas = vi.fn(() => Promise.resolve(ethers.BigNumber.from(1)));
    const signer = new ethers.VoidSigner(voter);
    const error = new Error("rejected");

    await expect(
      sendWithGasCheck({
        signer,
        gasOverrides: { maxFeePerGas: "1" },
        estimateGas,
        send: () => Promise.resolve("sent"),
      })
    ).resolves.toBe("sent");
    await expect(
      sendWithGasCheck({
        signer,
        gasOverrides: {},
        estimateGas,
        send: () => Promise.reject(error),
      })
    ).rejects.toBe(error);
    expect(estimateGas).not.toHaveBeenCalled();
  });

  it.each([
    ["ethers' ACTION_REJECTED", { code: "ACTION_REJECTED" }],
    ["a wallet's EIP-1193 4001", { code: 4001, message: "User rejected." }],
  ])("doesn't check when the user rejects (%s)", async (_, error) => {
    const estimateGas = vi.fn(() => Promise.resolve(ethers.BigNumber.from(1)));

    await expect(
      sendWithGasCheck({
        signer: new ethers.VoidSigner(voter),
        gasOverrides: { maxFeePerGas: "1" },
        estimateGas,
        send: () => Promise.reject(error),
      })
    ).rejects.toBe(error);
    expect(estimateGas).not.toHaveBeenCalled();
  });
});

describe("insufficientEthForGasMessage", () => {
  it.each([
    ["0.00682569", "0.0069"],
    ["0.00047496714", "0.00048"],
    ["0.0068", "0.0068"],
    ["1.234", "1.3"],
    ["0.0991", "0.1"],
    ["0.991", "1"],
    ["0.000000000000000001", "0.000000000000000001"],
  ])("rounds %s ETH up to %s", (cost, shown) => {
    expect(insufficientEthForGasMessage(ethers.utils.parseEther(cost))).toBe(
      `Connected wallet does not have enough ETH for gas; estimated gas cost = ${shown} ETH.`
    );
  });
});
