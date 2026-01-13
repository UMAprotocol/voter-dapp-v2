import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type } from "superstruct";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { handleApiError, HttpError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

const querySchema = type({
  questionId: hexString(),
});

interface PolymarketMarket {
  outcomes: string;
  question: string;
  questionID: string;
  groupItemTitle?: string;
}

export type GetPolymarketOutcomesResponse = {
  outcomes: string[];
  question?: string;
  groupItemTitle?: string;
  found: boolean;
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<GetPolymarketOutcomesResponse | { error: string }>
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

    // Query Polymarket gamma API using GraphQL
    const graphqlQuery = `
      {
        markets(where: "LOWER(question_id) = LOWER('${questionId}') or LOWER(neg_risk_request_id) = LOWER('${questionId}')") {
          outcomes
          question
          questionID
          groupItemTitle
        }
      }
    `;

    const graphqlResponse = await fetch(
      "https://gamma-api.polymarket.com/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: graphqlQuery }),
      }
    );

    const graphqlData = (await graphqlResponse.json()) as {
      data?: { markets: PolymarketMarket[] };
      errors?: { message: string }[];
    };

    if (graphqlData.errors?.length) {
      console.error(
        "Polymarket GraphQL error:",
        graphqlData.errors.map((e) => e.message).join("; ")
      );
      response.setHeader("Cache-Control", "max-age=60, s-maxage=60");
      return response.status(200).json({
        outcomes: [],
        found: false,
      });
    }

    const markets = graphqlData.data?.markets ?? [];

    if (markets.length === 0) {
      // Try the REST API as fallback
      const restData = (await fetch(
        `https://gamma-api.polymarket.com/markets?${buildSearchParams({
          question_ids: questionId,
        })}`
      ).then((res) => res.json())) as PolymarketMarket[];

      if (restData && restData.length > 0) {
        const market = restData[0];
        let outcomes: string[] = [];
        try {
          outcomes = JSON.parse(market.outcomes) as string[];
        } catch {
          outcomes = [];
        }

        response.setHeader(
          "Cache-Control",
          "max-age=3600, s-maxage=86400, stale-while-revalidate"
        );
        return response.status(200).json({
          outcomes,
          question: market.question,
          groupItemTitle: market.groupItemTitle,
          found: true,
        });
      }

      response.setHeader("Cache-Control", "max-age=60, s-maxage=300");
      return response.status(200).json({
        outcomes: [],
        found: false,
      });
    }

    // Parse outcomes from the first market
    const market = markets[0];
    let outcomes: string[] = [];
    try {
      outcomes = JSON.parse(market.outcomes) as string[];
    } catch {
      outcomes = [];
    }

    response.setHeader(
      "Cache-Control",
      "max-age=3600, s-maxage=86400, stale-while-revalidate"
    );
    return response.status(200).json({
      outcomes,
      question: market.question,
      groupItemTitle: market.groupItemTitle,
      found: true,
    });
  } catch (e) {
    return handleApiError(e, response);
  }
}
