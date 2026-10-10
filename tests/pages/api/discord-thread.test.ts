import { afterEach, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("pages/api/discord-thread/_utils", () => ({
  getCachedProcessedThread: vi.fn(),
  getCachedThreadIdMap: vi.fn(),
  buildThreadIdMap: vi.fn(),
}));
vi.mock("helpers", () => ({}));
vi.mock("helpers/config", () => ({ config: {}, chainConstantsList: [] }));

import handler from "pages/api/discord-thread";
import {
  getCachedProcessedThread,
  getCachedThreadIdMap,
  buildThreadIdMap,
} from "pages/api/discord-thread/_utils";
import { makeKey } from "lib/discord-utils";

const time = 1791500000;
const title = "Will it rain?";
const threadId = "1426000000000000000";
const query = { identifier: "YES_OR_NO_QUERY", title, time: String(time) };

async function lookup(requestQuery = query) {
  const response = {
    setHeader: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  await handler(
    { query: requestQuery } as unknown as NextApiRequest,
    response as unknown as NextApiResponse
  );
  return response;
}

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

it.each([null, { identifier: query.identifier, time, thread: [] }])(
  "returns a direct thread ID when comments are absent, including old caches",
  async (discussion) => {
    vi.mocked(getCachedProcessedThread).mockResolvedValue(discussion);
    vi.mocked(getCachedThreadIdMap).mockResolvedValue({
      threadIdMap: { [makeKey(title, time)]: [threadId] },
      latestThreadId: threadId,
    });
    const response = await lookup();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      identifier: query.identifier,
      time,
      thread: [],
      threadId,
    });
    expect(buildThreadIdMap).not.toHaveBeenCalled();
  }
);

it.each([
  { ids: [threadId, "1426000000000000001"] },
  { ids: ["invalid"] },
  { ids: [] },
])(
  "does not choose an ambiguous, invalid, or missing thread (%j)",
  async ({ ids }) => {
    vi.mocked(getCachedThreadIdMap).mockResolvedValue({
      threadIdMap: { [makeKey(title, time)]: ids },
      latestThreadId: null,
    });
    expect((await lookup()).send).toHaveBeenCalledWith(
      expect.objectContaining({ thread: [], threadId: undefined })
    );
  }
);

it("does not infer a legacy N/A thread from its timestamp alone", async () => {
  vi.mocked(getCachedThreadIdMap).mockResolvedValue({
    threadIdMap: { [makeKey("N/A", time)]: [threadId] },
    latestThreadId: null,
  });
  expect((await lookup({ ...query, title: "N/A" })).send).toHaveBeenCalledWith(
    expect.objectContaining({ threadId: undefined })
  );
});

it("preserves a thread ID already verified by the warmer", async () => {
  vi.mocked(getCachedProcessedThread).mockResolvedValue({
    identifier: query.identifier,
    time,
    thread: [],
    threadId,
  });
  expect((await lookup()).send).toHaveBeenCalledWith(
    expect.objectContaining({ threadId })
  );
});

it("keeps cached discussions available if metadata lookup fails", async () => {
  const discussion = { identifier: query.identifier, time, thread: [] };
  vi.mocked(getCachedProcessedThread).mockResolvedValue(discussion);
  vi.mocked(getCachedThreadIdMap).mockRejectedValue(
    new Error("Redis unavailable")
  );
  const response = await lookup();
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.send).toHaveBeenCalledWith(
    expect.objectContaining(discussion)
  );
});

it("supports a read-only local lookup with Redis disabled", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("DISABLE_REDIS", "true");
  vi.mocked(buildThreadIdMap).mockResolvedValue({
    threadIdMap: { [makeKey(title, time)]: [threadId] },
    latestMessageId: threadId,
  });
  expect((await lookup()).send).toHaveBeenCalledWith(
    expect.objectContaining({ threadId, thread: [] })
  );
});

it("does not use live Discord lookups in production with Redis disabled", async () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DISABLE_REDIS", "true");
  await lookup();
  expect(buildThreadIdMap).not.toHaveBeenCalled();
});
