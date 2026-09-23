import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "pages/api/get-polymarket-link";

async function lookup(query: NextApiRequest["query"]) {
  const response = {
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
    json: vi.fn(),
  };
  await handler(
    { query } as NextApiRequest,
    response as unknown as NextApiResponse
  );
  return response;
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Polymarket market links", () => {
  it("looks up V2 by exact market ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "4805182",
          events: [{ slug: "central-park-temperature" }],
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await lookup({ marketId: "4805182" });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://gamma-api.polymarket.com/markets/4805182"
    );
    expect(response.send).toHaveBeenCalledWith({
      slug: "central-park-temperature",
    });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("does not cache a hidden V2 market as permanently missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 404 }))
    );
    const response = await lookup({ marketId: "4805182" });
    expect(response.send).toHaveBeenCalledWith({});
    expect(response.setHeader).toHaveBeenLastCalledWith(
      "Cache-Control",
      "no-store"
    );
  });

  it.each([
    new Response("denied", { status: 403 }),
    new Response(
      JSON.stringify({ id: "wrong", events: [{ slug: "wrong-event" }] })
    ),
  ])(
    "does not return a link on upstream errors or mismatched identity",
    async (upstream) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(upstream));
      const response = await lookup({ marketId: "4805182" });
      expect(response.status).toHaveBeenCalledWith(502);
      expect(response.send).not.toHaveBeenCalled();
    }
  );

  it("preserves V1 open and closed question ID searches", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("[]"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ events: [{ slug: "legacy-event" }] }]))
      );
    vi.stubGlobal("fetch", fetchMock);
    const response = await lookup({ questionId: "0x1234" });
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://gamma-api.polymarket.com/markets?question_ids=0x1234",
      "https://gamma-api.polymarket.com/markets?question_ids=0x1234&closed=true",
    ]);
    expect(response.send).toHaveBeenCalledWith({ slug: "legacy-event" });
  });

  it.each([
    {},
    { marketId: "../events" },
    { marketId: ["1", "2"] },
    { questionId: "0x1234", marketId: "1" },
  ])("rejects ambiguous or invalid IDs", async (query) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await lookup(query);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
