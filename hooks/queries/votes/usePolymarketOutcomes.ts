import { useQuery } from "@tanstack/react-query";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { string, type, create, array, boolean, optional } from "superstruct";

const returnData = type({
  outcomes: array(string()),
  question: optional(string()),
  groupItemTitle: optional(string()),
  found: boolean(),
});

export type PolymarketOutcomesData = {
  outcomes: string[];
  question?: string;
  groupItemTitle?: string;
  found: boolean;
};

async function getPolymarketOutcomes(
  questionId: string | undefined
): Promise<PolymarketOutcomesData> {
  if (!questionId) {
    throw new Error("Unable to fetch polymarket outcomes. Missing Question ID");
  }

  const params = buildSearchParams({
    questionId,
  });

  const response = await fetch(`/api/get-polymarket-outcomes?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Getting Polymarket outcomes failed with unknown error");
  }

  const data = create(await response.json(), returnData);
  return data;
}

export function usePolymarketOutcomes(
  questionId: string | undefined,
  shouldFetch = true
) {
  return useQuery({
    queryKey: ["polymarket-outcomes", questionId],
    queryFn: () => getPolymarketOutcomes(questionId),
    onError: (err) =>
      console.warn(
        `Unable to fetch outcomes for questionId ${
          questionId ?? "MISSING PARAM"
        }`,
        { cause: err }
      ),
    enabled: !!questionId && shouldFetch,
    refetchInterval: Infinity,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
