import { hexString } from "helpers/validators";
import { NextApiRequest, NextApiResponse } from "next";
import { type, create } from "superstruct";
import { HttpError } from "./_common";
import { buildSearchParams } from "helpers/util/buildSearchParams";

const querySchema = type({
  questionId: hexString(),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const query = create(request.query, querySchema);
    const questionId = query?.questionId;

    if (!questionId) {
      throw new HttpError({
        status: 400,
        message: "Invalid Param: questionId must be valid hex string",
      });
    }

    console.log(`Fetching data for question ID: ${questionId}`);

    const data = (await fetch(
      `https://gamma-api.polymarket.com/markets?${buildSearchParams({
        question_ids: questionId,
      })}`
    ).then((res) => res.json())) as Array<{
      events: Array<{
        slug: string;
      }>;
    }>;

    console.log(`Found DATA for question ID: ${questionId}`, data);
    console.log("events", data[0]["events"]);

    const slug = data?.[0]?.events?.[0]?.slug;

    response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000");
    response.status(200).send({ slug });
  } catch (e) {
    console.error(e);

    response.status(e instanceof HttpError ? e.status : 500).send({
      message: "Server error",
      error: e instanceof Error ? e.message : e,
    });
  }
}
