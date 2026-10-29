import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { ContentfulDataT } from "types";
import { contentfulClient, getUmipEntries } from "lib/contentful";
import { handleApiError } from "./_utils/errors";
import { validateQueryParams } from "./_utils/validation";

// UMIP entries change rarely (new admin proposals are infrequent), so let the
// CDN serve them and refresh in the background
const TTL = 60 * 10;

const RequestSchema = ss.object({
  // comma-separated admin proposal numbers, e.g. "12,34,56"
  numbers: ss.pattern(ss.string(), /^\d+(,\d+)*$/),
});

export type ContentfulUmipsResponse = {
  entries: ContentfulDataT[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentfulUmipsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { numbers } = validateQueryParams(req.query, RequestSchema);

    if (!contentfulClient) {
      // not configured: degrade to "no CMS data" rather than an error, but
      // don't let the CDN cache the empty response for long
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
      return res.status(200).json({ entries: [] });
    }

    const entries = await getUmipEntries(numbers.split(",").map(Number));

    res.setHeader(
      "Cache-Control",
      `public, max-age=0, s-maxage=${TTL}, stale-while-revalidate=86400`
    );
    return res.status(200).json({ entries });
  } catch (error) {
    return handleApiError(error, res);
  }
}
