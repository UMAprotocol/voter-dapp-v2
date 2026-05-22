// Maps deprecated initializer EOAs to the current bulletin-board owner that
// posts clarifications on their behalf. The questionId remains unchanged.
// May 20, 2026 at 1:00 PM PT.
export const deprecatedPolymarketBulletinOwnerCutoffTimestamp = 1779307200;

type BulletinOwnerRemap = {
  owner: string;
  deprecatedOwnerUpdatesUntil?: number;
};

export type BulletinOwnerQuery = {
  owner: string;
  maxTimestamp?: number;
};

const bulletinOwnerRemaps: Record<string, BulletinOwnerRemap> = {
  "0x91430cad2d3975766499717fa0d66a78d814e5c5": {
    owner: "0xF43d55F3A8B7484Ed4B6931f93CB6F9eF5Dd369D",
    deprecatedOwnerUpdatesUntil:
      deprecatedPolymarketBulletinOwnerCutoffTimestamp,
  },
};

export function resolveBulletinOwner(initializer: string): string {
  return bulletinOwnerRemaps[initializer.toLowerCase()]?.owner ?? initializer;
}

export function getBulletinOwnerQueries(
  initializer: string
): BulletinOwnerQuery[] {
  const ownerRemap = bulletinOwnerRemaps[initializer.toLowerCase()];

  if (!ownerRemap) {
    return [{ owner: initializer }];
  }

  const ownerQueries: BulletinOwnerQuery[] = [{ owner: ownerRemap.owner }];

  if (ownerRemap.deprecatedOwnerUpdatesUntil !== undefined) {
    ownerQueries.push({
      owner: initializer,
      maxTimestamp: ownerRemap.deprecatedOwnerUpdatesUntil,
    });
  }

  return ownerQueries;
}
