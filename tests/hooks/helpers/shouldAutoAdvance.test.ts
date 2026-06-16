import { describe, expect, it } from "vitest";
import { shouldAutoAdvance } from "hooks/helpers/shouldAutoAdvance";

describe("shouldAutoAdvance", () => {
  it("advances when enabled, an option is chosen, and there is a next vote", () => {
    expect(
      shouldAutoAdvance({ enabled: true, value: "0", canGoNext: true })
    ).toBe(true);
  });

  it("does not advance when the preference is off", () => {
    expect(
      shouldAutoAdvance({ enabled: false, value: "0", canGoNext: true })
    ).toBe(false);
  });

  // Re-clicking the selected option deselects it (value === undefined); the user
  // expects to stay on the current vote rather than skip an unanswered one.
  it("does not advance when the option is being deselected", () => {
    expect(
      shouldAutoAdvance({ enabled: true, value: undefined, canGoNext: true })
    ).toBe(false);
  });

  // On the last vote canGoNext is false, so we never advance past the end and
  // leave the user stranded away from the commit action.
  it("does not advance on the last vote", () => {
    expect(
      shouldAutoAdvance({ enabled: true, value: "1", canGoNext: false })
    ).toBe(false);
  });

  it("treats an empty-string selection as a real choice", () => {
    expect(
      shouldAutoAdvance({ enabled: true, value: "", canGoNext: true })
    ).toBe(true);
  });
});
