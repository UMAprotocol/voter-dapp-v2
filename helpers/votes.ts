export function makeUniqueKeyForVote(identifier: string, time: number, ancillaryData: string) {
  return `${identifier}-${time}-${ancillaryData}`;
}
