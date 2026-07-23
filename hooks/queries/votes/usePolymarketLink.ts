import { useQuery } from "@tanstack/react-query";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { warnOnce } from "helpers/util/log";
import { string, type, create, optional } from "superstruct";

const returnData = type({
  slug: optional(string()),
});

async function getPolymarketLink(
  questionId: string | undefined
): Promise<string | undefined> {
  if (!questionId) {
    throw new Error("Unable to fetch polymarket link. Missing Question ID");
  }

  const POLYMARKET_BASE_URL = "https://polymarket.com";
  const params = buildSearchParams({
    questionId,
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
  if (data.slug) {
    return `${POLYMARKET_BASE_URL}/event/${data.slug}`;
  }
}

export function usePolymarketLink(
  questionId: string | undefined,
  shouldFetch = true
) {
  return useQuery({
    queryKey: ["polymarketLink", questionId],
    queryFn: () => getPolymarketLink(questionId),
    onError: (err) =>
      warnOnce(
        `polymarket-link:${questionId ?? ""}`,
        `Unable to fetch polymarket slug for ${questionId ?? "MISSING PARAM"}`,
        { cause: err }
      ),
    enabled: !!questionId && shouldFetch,
    refetchInterval: Infinity,
    refetchOnMount: false,
  });
}
