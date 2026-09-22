import { beforeEach, describe, expect, it, vi } from "vitest";
import { BigNumber } from "ethers";
import { formatBytes32String } from "ethers/lib/utils";
import { encodeHexString } from "helpers/web3/decodeHexString";
import { RawDiscordMessageT } from "types";

vi.mock("helpers/config", () => ({ config: {}, chainConstantsList: [] }));
vi.mock("lib/l2-ancillary-data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("lib/l2-ancillary-data")>()),
  fetchBridgedEventsAt: vi.fn(),
}));

import { createRequestHash, fetchBridgedEventsAt } from "lib/l2-ancillary-data";
import { matchesLegacyQuestionThread } from "lib/legacy-question-thread";

const request = {
  identifier: formatBytes32String("YES_OR_NO_QUERY"),
  time: 1789906965,
  ancillaryData: encodeHexString(
    `ancillaryDataHash:${"a".repeat(
      64
    )},childBlockNumber:51558920,childOracle:${"b".repeat(
      40
    )},childRequester:${"c".repeat(40)},childChainId:8453`
  ),
  decodedAncillaryData: "q: Will it rain?,rules: Yes if rain.,ooRequester:1234",
};
const transactionHash = `0x${"d".repeat(64)}`;
const parentRequestId = createRequestHash({
  ...request,
  time: String(request.time),
});
const event = {
  transactionHash,
  args: { parentRequestId, time: BigNumber.from(request.time) },
};
const announcement = {
  id: "1234",
  author: { bot: true },
  content: `**Timestamp:** ${request.time}\n**Network:** Base\n**Transaction:** https://basescan.org/tx/${transactionHash}`,
} as RawDiscordMessageT;

function setEvents(events: (typeof event)[]) {
  vi.mocked(fetchBridgedEventsAt).mockResolvedValue(
    events as unknown as Awaited<ReturnType<typeof fetchBridgedEventsAt>>
  );
}

beforeEach(() => setEvents([event]));

describe("legacy N/A question threads", () => {
  it("matches the exact bridged request and starter transaction", async () => {
    expect(await matchesLegacyQuestionThread(request, [announcement])).toBe(
      true
    );
  });

  it("rejects a different request at the same timestamp or on another chain", async () => {
    setEvents([
      {
        ...event,
        args: { ...event.args, parentRequestId: `0x${"e".repeat(64)}` },
      },
    ]);
    expect(await matchesLegacyQuestionThread(request, [announcement])).toBe(
      false
    );
    setEvents([event]);
    expect(
      await matchesLegacyQuestionThread(request, [
        {
          ...announcement,
          content: announcement.content.replace(
            "basescan.org",
            "polygonscan.com"
          ),
        },
      ])
    ).toBe(false);
  });

  it("rejects transactions containing multiple requests at the same timestamp", async () => {
    setEvents([
      event,
      {
        ...event,
        args: { ...event.args, parentRequestId: `0x${"e".repeat(64)}` },
      },
    ]);
    expect(await matchesLegacyQuestionThread(request, [announcement])).toBe(
      false
    );
  });

  it("does not use a transaction link supplied in a later reply", async () => {
    expect(
      await matchesLegacyQuestionThread(request, [
        { ...announcement, id: "2345" },
        { ...announcement, content: "An unrelated announcement" },
      ])
    ).toBe(false);
  });
});
