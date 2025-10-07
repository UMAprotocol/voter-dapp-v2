import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type } from "superstruct";
import { HttpError } from "./_common";
import { buildSearchParams } from "helpers/util/buildSearchParams";
import { handleApiError } from "./_utils/errors";
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
        status: 400,
        message: "Invalid Param: questionId must be valid hex string",
      });
    }

    const data = (await fetch(
      `https://gamma-api.polymarket.com/markets?${buildSearchParams({
        question_ids: questionId,
      })}`
    ).then((res) => res.json())) as Array<{
      events: Array<{
        slug: string;
      }>;
    }>;

    const slug = data?.[0]?.events?.[0]?.slug;
    response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
    response.status(200).send({ slug });
  } catch (e) {
    return handleApiError(e, response);
  }
}
