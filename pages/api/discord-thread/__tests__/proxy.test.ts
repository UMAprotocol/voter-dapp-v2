import { describe, expect, it, vi } from "vitest";
import { getDiscordRequestTarget } from "../_utils";

// Mock helpers/config to avoid resolving @uma/contracts-frontend dependency, which breaks in this environment
vi.mock("helpers/config", () => ({
  config: {},
}));

const endpoint = "channels/964000735073284127/messages?limit=100";

describe("getDiscordRequestTarget", () => {
  it("calls Discord directly with the bot token when no proxy is configured", () => {
    expect(
      getDiscordRequestTarget(endpoint, {
        token: "bot-token",
        proxyUrl: "",
        proxyKey: "",
      })
    ).toEqual({
      url: `https://discord.com/api/v10/${endpoint}`,
      authorization: "Bot bot-token",
    });
  });

  it("uses the proxy with a bearer key when both proxy vars are set", () => {
    expect(
      getDiscordRequestTarget(endpoint, {
        token: "bot-token",
        proxyUrl: "https://proxy.example.com",
        proxyKey: "proxy-key",
      })
    ).toEqual({
      url: `https://proxy.example.com/discord-proxy/${endpoint}`,
      authorization: "Bearer proxy-key",
    });
  });

  it("tolerates a trailing slash on the proxy URL", () => {
    expect(
      getDiscordRequestTarget(endpoint, {
        token: "bot-token",
        proxyUrl: "https://proxy.example.com/",
        proxyKey: "proxy-key",
      }).url
    ).toBe(`https://proxy.example.com/discord-proxy/${endpoint}`);
  });

  it("falls back to Discord directly when only one proxy var is set", () => {
    expect(
      getDiscordRequestTarget(endpoint, {
        token: "bot-token",
        proxyUrl: "https://proxy.example.com",
        proxyKey: "",
      }).authorization
    ).toBe("Bot bot-token");
    expect(
      getDiscordRequestTarget(endpoint, {
        token: "bot-token",
        proxyUrl: "",
        proxyKey: "proxy-key",
      }).authorization
    ).toBe("Bot bot-token");
  });
});
