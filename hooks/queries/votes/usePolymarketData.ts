import { useQuery } from "@tanstack/react-query";

type PolymarketResponse = {
  slug: string;
  title: string;
  icon: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  volume: number;
  createdAt: string;
  updatedAt: string;
}[];

export type PolymarketData = PolymarketResponse[number] & {
  link: string;
};

function isPolymarketResponse(data: unknown): data is PolymarketResponse {
  return Array.isArray(data) &&
    data.length &&
    typeof data[0] === "object" &&
    data[0] &&
    "slug" in data[0]
    ? true
    : false;
}

/**
 * Searches Polymarket's api for a a market using a market's title.
 *
 * @param {string} title - The title of the market.
 * @returns {PolymarketData} data - Relevant market data
 */
async function getPolymarketData(title: string): Promise<PolymarketData> {
  const POLYMARKET_BASE_URL = "https://polymarket.com";
  const params = new URLSearchParams({
    _c: "all",
    _p: "1",
    _q: title,
  });

  const url = `https://polymarket.com/api/events/search?${params.toString()}`;
  const res = await fetch(url);
  const search = await res.json();
  if (!isPolymarketResponse(search)) {
    throw new Error("Unable to find market.");
  }
  const data = search[0];

  return {
    ...data,
    link: `${POLYMARKET_BASE_URL}/event/${data.slug}`,
  };
}

export function usePolymarketData(title: string, shouldFetch = true) {
  return useQuery({
    queryKey: [title],
    queryFn: () => getPolymarketData(title),
    onError: (err) => console.error(err),
    enabled: !!title && shouldFetch,
    refetchInterval: Infinity,
    refetchOnMount: false,
  });
}
