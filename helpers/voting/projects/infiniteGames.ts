const infiniteGamesChainId = 137;

function isInfiniteGamesChain(chainId: number | undefined) {
  if (!chainId) return false;
  return chainId === infiniteGamesChainId;
}

// Infinite Games Requesters
const infiniteGamesRequesters = [
  "0x8edec74d4e93b69bb8b1d9ba888d498a58846cb5",
  "0x4cb80ebdcabc9420edd4b5a5b296bbc86848206d",
];

export function isInfiniteGamesRequester(address: string | undefined): boolean {
  if (!address) return false;
  return infiniteGamesRequesters.includes(address.toLowerCase());
}

export function getRequester(decodedAncillaryData: string): string | undefined {
  const match = decodedAncillaryData.match(/ooRequester:(\w+)/) ?? [];
  return match[1] ? "0x" + match[1] : undefined;
}

export function getChildChainId(
  decodedAncillaryData: string
): number | undefined {
  const match = decodedAncillaryData.match(/childChainId:(\d+)/) ?? [];
  return match[1] ? Number(match[1]) : undefined;
}

export function checkIfIsInfiniteGames(decodedAncillaryData: string) {
  const requester = getRequester(decodedAncillaryData);
  const disputeChainId = getChildChainId(decodedAncillaryData);
  return (
    isInfiniteGamesRequester(requester) &&
    requester &&
    isInfiniteGamesChain(disputeChainId)
  );
}
