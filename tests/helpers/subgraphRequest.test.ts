import { subgraphRequest } from "helpers/util/subgraphRequest";
import { describe, expect, it, vi } from "vitest";

const requestMock = vi.hoisted(() => vi.fn());
vi.mock("graphql-request", () => ({ default: requestMock }));

describe("subgraphRequest", () => {
  it("resolves with the underlying request's result", async () => {
    requestMock.mockResolvedValueOnce({ priceRequests: [] });
    await expect(
      subgraphRequest("https://example.com/subgraph", "query {}")
    ).resolves.toEqual({ priceRequests: [] });
  });

  it("rejects when the request hangs past the timeout", async () => {
    // a hung subgraph never settles; the abort signal is the only way out
    requestMock.mockImplementationOnce(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        })
    );
    await expect(
      subgraphRequest("https://example.com/subgraph", "query {}", undefined, 20)
    ).rejects.toThrow(/timed out after 20ms/);
  });

  it("passes real errors through instead of reporting a timeout", async () => {
    requestMock.mockRejectedValueOnce(new Error("bad query"));
    await expect(
      subgraphRequest("https://example.com/subgraph", "query {}")
    ).rejects.toThrow("bad query");
  });
});
