import { describe, expect, it } from "vitest";
import { pruneSelectedVotes } from "helpers/voting/pruneSelectedVotes";

describe("pruneSelectedVotes", () => {
  it("drops selections that are not active votes", () => {
    const selected = { "active-1": "p1", "stale-1": "p2", "stale-2": "p3" };
    expect(pruneSelectedVotes(selected, new Set(["active-1"]))).toEqual({
      "active-1": "p1",
    });
  });

  // Reference stability matters: the caller prunes inside an effect that
  // re-runs on state change, so a new object for identical content loops.
  it("returns the same object when nothing is stale", () => {
    const selected = { "active-1": "p1" };
    expect(
      pruneSelectedVotes(selected, new Set(["active-1", "active-2"]))
    ).toBe(selected);
  });
});
