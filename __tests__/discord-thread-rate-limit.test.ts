import { describe, expect, it, vi } from "vitest";
import { getRetryMilliseconds } from "../pages/api/discord-thread/_utils";

// Mock helpers/config to avoid resolving @uma/contracts-frontend dependency, which breaks in this environment
vi.mock("helpers/config", () => ({
  config: {},
}));

describe("getRetryMilliseconds respects X-RateLimit-Reset-After header", () => {
  it("converts X-RateLimit-Reset-After seconds to milliseconds", () => {
    // Create a mock Response with X-RateLimit-Reset-After header
    const mockResponse = new Response(null, {
      status: 429,
      statusText: "You are being rate limited",
      headers: {
        "X-RateLimit-Reset-After": "2.5",
      },
    });

    const delay = getRetryMilliseconds(mockResponse, 1);
    expect(delay).toBe(2500); // 2.5 seconds = 2500ms
  });

  it("falls back to exponential backoff when header is missing", () => {
    const mockResponse = new Response(null, {
      status: 429,
    });

    const delay = getRetryMilliseconds(mockResponse, 1);
    // 2000 + max jitter (1000), starts small
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThanOrEqual(3000);
  });

  it("falls back to exponential backoff when header is invalid", () => {
    const mockResponse = new Response(null, {
      status: 429,
      headers: {
        "X-RateLimit-Reset-After": "invalid",
      },
    });

    const delay = getRetryMilliseconds(mockResponse, 1);
    // 2000 + max jitter (1000), starts small
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThanOrEqual(3000);
  });
});
