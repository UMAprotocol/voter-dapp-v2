import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type } from "superstruct";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const querySchema = type({
  questionId: hexString(),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const query = validateQueryParams(request.query, querySchema);
    const questionId = query?.questionId;

    if (!questionId) {
      throw new HttpError({
        statusCode: 400,
        msg: "Invalid Param: questionId must be valid hex string",
      });
    }

    type Market = { events: Array<{ slug: string }> };
    const baseUrl = "https://gamma-api.polymarket.com/markets";
    async function fetchMarkets(params: Record<string, string>) {
      const res = await fetch(`${baseUrl}?${buildSearchParams(params)}`);
      const payload: unknown = await res.json();
      return Array.isArray(payload) ? (payload as Market[]) : [];
    }

    const results = await Promise.allSettled([
      fetchMarkets({ question_ids: questionId }),
      fetchMarkets({ question_ids: questionId, closed: "true" }),
    ]);
    const markets = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : []
    );
    const slug = markets[0]?.events?.[0]?.slug;
    response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
    response.status(200).send({ slug });
  } catch (e) {
    return handleApiError(e, response);
  }
}
