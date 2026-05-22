import { describe, expect, it } from "vitest";

import {
  deprecatedPolymarketBulletinOwnerCutoffTimestamp,
  getBulletinOwnerQueries,
  resolveBulletinOwner,
} from "../polymarketBulletinOwners";

const deprecatedInitializer = "0x91430cad2d3975766499717fa0d66a78d814e5c5";
const currentBulletinOwner = "0xF43d55F3A8B7484Ed4B6931f93CB6F9eF5Dd369D";

describe("resolveBulletinOwner", () => {
  it("maps the deprecated Polymarket initializer to the current bulletin owner", () => {
    expect(resolveBulletinOwner(deprecatedInitializer)).toBe(
      currentBulletinOwner
    );
  });

  it("matches deprecated initializer addresses case-insensitively", () => {
    expect(resolveBulletinOwner(deprecatedInitializer.toUpperCase())).toBe(
      currentBulletinOwner
    );
  });

  it("returns unmapped initializer addresses unchanged", () => {
    const initializer = "0x1111111111111111111111111111111111111111";

    expect(resolveBulletinOwner(initializer)).toBe(initializer);
  });
});

describe("getBulletinOwnerQueries", () => {
  it("queries the current owner and the deprecated owner with a cutoff", () => {
    expect(getBulletinOwnerQueries(deprecatedInitializer)).toEqual([
      { owner: currentBulletinOwner },
      {
        owner: deprecatedInitializer,
        maxTimestamp: deprecatedPolymarketBulletinOwnerCutoffTimestamp,
      },
    ]);
  });

  it("returns one unchanged owner query for unmapped initializers", () => {
    const initializer = "0x1111111111111111111111111111111111111111";

    expect(getBulletinOwnerQueries(initializer)).toEqual([
      { owner: initializer },
    ]);
  });
});
