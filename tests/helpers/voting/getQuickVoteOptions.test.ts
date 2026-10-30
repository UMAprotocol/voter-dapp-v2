import { describe, expect, it } from "vitest";
import { getQuickVoteOptions } from "helpers/voting/getSelectableQuickOptions";
import type { DropdownItemT } from "types";

const numbers = (options: DropdownItemT[]) =>
  getQuickVoteOptions(options).map(({ option, number }) => [
    number,
    option.label,
  ]);

describe("getQuickVoteOptions", () => {
  it("numbers Polymarket options by their p-code", () => {
    expect(
      numbers([
        { label: "No", value: "0", secondaryLabel: "p1" },
        { label: "Yes", value: "1", secondaryLabel: "p2" },
        { label: "Early request", value: "-1", secondaryLabel: "p4" },
        { label: "Custom", value: "custom" },
      ])
    ).toEqual([
      [1, "No"],
      [2, "Yes"],
      [4, "Early request"],
    ]);
  });

  it("numbers by position when options lack unique p-codes", () => {
    expect(
      numbers([
        { label: "No", value: "0", secondaryLabel: "0" },
        { label: "Yes", value: "1", secondaryLabel: "1000000000000000000" },
        { label: "Custom", value: "custom" },
      ])
    ).toEqual([
      [1, "No"],
      [2, "Yes"],
    ]);
    expect(
      numbers([
        { label: "A", value: "0", secondaryLabel: "p1" },
        { label: "B", value: "1", secondaryLabel: "p1" },
      ])
    ).toEqual([
      [1, "A"],
      [2, "B"],
    ]);
    expect(
      numbers([
        { label: "A", value: "0", secondaryLabel: "p1" },
        { label: "B", value: "1" },
      ])
    ).toEqual([
      [1, "A"],
      [2, "B"],
    ]);
  });
});
