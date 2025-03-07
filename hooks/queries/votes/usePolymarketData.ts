import { useQuery } from "@tanstack/react-query";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { string, type, create } from "superstruct";

const returnData = type({
  slug: string(),
});

async function getPolymarketLink(txHash: string): Promise<string> {
  const POLYMARKET_BASE_URL = "https://polymarket.com";
  const params = buildSearchParams({
    txHash,
  });

  const response = await fetch(`/api/get-polymarket-link?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Getting Polymarket link failed with unknown error");
  }
  const data = create(await response.json(), returnData);

  return `${POLYMARKET_BASE_URL}/event/${data.slug}`;
}

export function usePolymarketLink(txHash: string, shouldFetch = true) {
  return useQuery({
    queryKey: [txHash],
    queryFn: () => getPolymarketLink(txHash),
    onError: (err) => console.error(err),
    enabled: !!txHash && shouldFetch,
    refetchInterval: Infinity,
    refetchOnMount: false,
  });
}
