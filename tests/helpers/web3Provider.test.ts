import { Web3Provider } from "helpers/web3/provider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const transactionHash = `0x${"ab".repeat(32)}`;
const receipt = { transactionHash, blockNumber: "0x1" };
const notFound = Object.assign(new Error("Internal JSON-RPC error."), {
  code: -32603,
  data: { code: -32000, message: "transaction not found" },
});

function setup(...responses: unknown[]) {
  const request = vi.fn();
  for (const response of responses) {
    if (response instanceof Error) request.mockRejectedValueOnce(response);
    else request.mockResolvedValueOnce(response);
  }
  return { request, provider: new Web3Provider({ request }, 1) };
}

describe("Web3Provider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries transaction lookups that are not found yet", async () => {
    const { request, provider } = setup(notFound, notFound, receipt);
    const result = provider.perform("getTransactionReceipt", {
      transactionHash,
    });
    await vi.advanceTimersByTimeAsync(999);
    expect(request).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2001);
    await expect(result).resolves.toBe(receipt);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("gives up after a few retries", async () => {
    const { request, provider } = setup(...Array<unknown>(5).fill(notFound));
    const result = provider.perform("getTransaction", { transactionHash });
    const assertion = expect(result).rejects.toBe(notFound);
    await vi.advanceTimersByTimeAsync(15000);
    await assertion;
    expect(request).toHaveBeenCalledTimes(5);
  });

  it("does not retry other errors", async () => {
    const error = new Error("execution reverted");
    const { request, provider } = setup(error);
    await expect(
      provider.perform("getTransactionReceipt", { transactionHash })
    ).rejects.toBe(error);
    expect(request).toHaveBeenCalledOnce();
  });

  it("does not retry other methods", async () => {
    const { request, provider } = setup(notFound);
    await expect(
      provider.perform("getBlock", { blockTag: "latest" })
    ).rejects.toBe(notFound);
    expect(request).toHaveBeenCalledOnce();
  });
});
