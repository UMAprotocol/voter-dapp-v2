import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import { BigNumber, utils } from "ethers";
import live from "../../helpers/voting/projects/polymarket-v2-fixture.json";
import {
  parsePolymarketV2AncillaryData,
  polymarketV2Reporter,
  polymarketV2ManagedOracle,
} from "lib/polymarket-v2";

const mocks = vi.hoisted(() => ({
  getBlock: vi.fn(),
  getRequestRulesUpdates: vi.fn(),
  address: vi.fn(),
}));
vi.mock("helpers/config", () => ({
  getProvider: () => ({ getBlock: mocks.getBlock }),
}));
vi.mock("ethers", async (original) => {
  const actual = await original<typeof import("ethers")>();
  return {
    ...actual,
    Contract: class {
      constructor(address: string) {
        mocks.address(address);
      }
      getRequestRulesUpdates = mocks.getRequestRulesUpdates;
    },
  };
});
import handler from "pages/api/polymarket-v2-rule-updates";

const rules = utils.hexlify(
  utils.toUtf8Bytes(parsePolymarketV2AncillaryData(live.text)?.rawRules ?? "")
);
async function call(
  body = { identifier: "YES_OR_NO_QUERY", ancillaryData: live.resolved }
) {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  await handler(
    { method: "POST", body } as NextApiRequest,
    res as unknown as NextApiResponse
  );
  return res;
}
beforeEach(() => {
  mocks.getBlock.mockResolvedValue({ number: 200 });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

it("reads the full Managed OO history using the reporter and exact original rules, without a timestamp", async () => {
  mocks.getRequestRulesUpdates.mockResolvedValue([
    {
      timestamp: BigNumber.from(1000),
      updatedRules: utils.hexlify(
        utils.toUtf8Bytes("Earlier update\nAdditional context")
      ),
    },
    {
      timestamp: BigNumber.from(1001),
      updatedRules: utils.hexlify(
        utils.toUtf8Bytes(
          '{"description":"Linked request update","other":"Keep this"}'
        )
      ),
    },
  ]);
  const res = await call();
  expect(mocks.address).toHaveBeenCalledWith(polymarketV2ManagedOracle);
  expect(mocks.getRequestRulesUpdates).toHaveBeenCalledWith(
    polymarketV2Reporter,
    utils.formatBytes32String("YES_OR_NO_QUERY"),
    rules,
    { blockTag: 200 }
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    bulletins: [
      { timestamp: 1000, update: "Earlier update\nAdditional context" },
      {
        timestamp: 1001,
        update: '{"description":"Linked request update","other":"Keep this"}',
      },
    ],
  });
});
it("returns an empty history only after a successful on-chain read", async () => {
  mocks.getRequestRulesUpdates.mockResolvedValue([]);
  const res = await call();
  expect(res.json).toHaveBeenCalledWith({ bulletins: [] });
  expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-store");
});
it("rejects noncanonical ancillary data before querying the chain", async () => {
  const res = await call({
    identifier: "YES_OR_NO_QUERY",
    ancillaryData: utils.hexlify(
      utils.toUtf8Bytes(live.text.replace("childChainId:137", "childChainId:1"))
    ),
  });
  expect(res.status).toHaveBeenCalledWith(400);
  expect(mocks.getRequestRulesUpdates).not.toHaveBeenCalled();
});
it("fails the whole history if an update cannot be decoded", async () => {
  mocks.getRequestRulesUpdates.mockResolvedValue([
    { timestamp: BigNumber.from(1000), updatedRules: "0xff" },
  ]);
  const res = await call();
  expect(res.status).toHaveBeenCalledWith(503);
});
it("does not expose RPC credentials or turn an RPC failure into empty updates", async () => {
  mocks.getRequestRulesUpdates.mockRejectedValue(
    new Error("https://rpc.example/private-test-key")
  );
  const res = await call();
  expect(res.status).toHaveBeenCalledWith(503);
  expect(JSON.stringify(res.json.mock.calls)).not.toContain("private-test-key");
  expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
    "private-test-key"
  );
});
