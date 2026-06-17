import { describe, expect, it, vi } from "vitest";
import { makeAutoAdvanceSelectVote } from "hooks/helpers/makeAutoAdvanceSelectVote";
import { VoteT } from "types";

// Only uniqueKey is read downstream; cast a minimal stub to VoteT.
const vote = { uniqueKey: "vote-1" } as VoteT;

function setup({
  enabled,
  canGoNext,
}: {
  enabled: boolean;
  canGoNext: boolean;
}) {
  const selectVote = vi.fn();
  const goToNextVote = vi.fn();
  const handle = makeAutoAdvanceSelectVote({
    selectVote,
    enabled,
    canGoNext,
    goToNextVote,
  });
  // Narrow away `undefined` (selectVote is always provided here) so the tests
  // can invoke the handler without a forbidden non-null assertion.
  if (!handle) throw new Error("expected a defined handler");
  return { selectVote, goToNextVote, handle };
}

describe("makeAutoAdvanceSelectVote", () => {
  it("returns undefined when there is no underlying selectVote", () => {
    const handle = makeAutoAdvanceSelectVote({
      selectVote: undefined,
      enabled: true,
      canGoNext: true,
      goToNextVote: vi.fn(),
    });
    expect(handle).toBeUndefined();
  });

  it("records the vote and advances when enabled, chosen, and not last", () => {
    const { selectVote, goToNextVote, handle } = setup({
      enabled: true,
      canGoNext: true,
    });
    handle("0", vote);
    expect(selectVote).toHaveBeenCalledWith("0", vote, { skipHighlight: true });
    expect(goToNextVote).toHaveBeenCalledTimes(1);
  });

  it("records the vote before advancing (ordering)", () => {
    const { selectVote, goToNextVote, handle } = setup({
      enabled: true,
      canGoNext: true,
    });
    handle("0", vote);
    // selectVote must run first so the selection is stored before the panel
    // swaps to the next vote.
    expect(selectVote.mock.invocationCallOrder[0]).toBeLessThan(
      goToNextVote.mock.invocationCallOrder[0]
    );
  });

  it("does not advance, and keeps the highlight, when the preference is off", () => {
    const { selectVote, goToNextVote, handle } = setup({
      enabled: false,
      canGoNext: true,
    });
    handle("0", vote);
    expect(selectVote).toHaveBeenCalledWith("0", vote, {
      skipHighlight: false,
    });
    expect(goToNextVote).not.toHaveBeenCalled();
  });

  it("does not advance when the option is being deselected", () => {
    const { selectVote, goToNextVote, handle } = setup({
      enabled: true,
      canGoNext: true,
    });
    handle(undefined, vote);
    expect(selectVote).toHaveBeenCalledWith(undefined, vote, {
      skipHighlight: false,
    });
    expect(goToNextVote).not.toHaveBeenCalled();
  });

  it("does not advance on the last vote", () => {
    const { selectVote, goToNextVote, handle } = setup({
      enabled: true,
      canGoNext: false,
    });
    handle("1", vote);
    expect(selectVote).toHaveBeenCalledWith("1", vote, {
      skipHighlight: false,
    });
    expect(goToNextVote).not.toHaveBeenCalled();
  });
});
