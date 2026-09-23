import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type, optional, pattern, string } from "superstruct";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const querySchema = type({
  questionId: optional(hexString()),
  marketId: optional(pattern(string(), /^\d+$/)),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const query = validateQueryParams(request.query, querySchema);
    response.setHeader("Cache-Control", "no-store");
    const questionId = query?.questionId;
    const marketId = query?.marketId;

    if (Boolean(questionId) === Boolean(marketId)) {
      throw new HttpError({
        statusCode: 400,
        msg: "Supply exactly one questionId or marketId",
      });
    }

    type Market = { id: string; events?: Array<{ slug?: string }> };
    const baseUrl = "https://gamma-api.polymarket.com/markets";
    if (marketId) {
      const res = await fetch(`${baseUrl}/${marketId}`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (res.status === 404) {
        response.status(200).send({});
        return;
      }
      if (!res.ok)
        throw new HttpError({
          statusCode: 502,
          msg: "Unable to reach Polymarket gamma API",
        });
      const market = (await res.json()) as Market;
      if (!market || String(market.id) !== marketId) {
        throw new HttpError({
          statusCode: 502,
          msg: "Polymarket market identity mismatch",
        });
      }
      const slug = market.events?.[0]?.slug;
      if (typeof slug === "string" && slug) {
        response.setHeader("Cache-Control", "max-age=0, s-maxage=300");
        response.status(200).send({ slug });
      } else {
        response.status(200).send({});
      }
      return;
    }
    if (!questionId) return;

    async function fetchMarkets(params: Record<string, string>) {
      const res = await fetch(`${baseUrl}?${buildSearchParams(params)}`);
      if (!res.ok)
        throw new HttpError({
          statusCode: 502,
          msg: "Unable to reach Polymarket gamma API",
        });
      const payload: unknown = await res.json();
      return Array.isArray(payload) ? (payload as Market[]) : [];
    }

    const results = await Promise.allSettled([
      fetchMarkets({ question_ids: questionId }),
      fetchMarkets({ question_ids: questionId, closed: "true" }),
    ]);
    if (results.every((r) => r.status === "rejected")) {
      throw new HttpError({
        statusCode: 502,
        msg: "Unable to reach Polymarket gamma API",
      });
    }

    const markets = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : []
    );
    const slug = markets[0]?.events?.[0]?.slug;

    if (slug) {
      response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
    }
    response.status(200).send({ slug });
  } catch (e) {
    return handleApiError(e, response);
  }
}
