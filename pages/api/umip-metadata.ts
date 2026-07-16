import { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";
import * as contentful from "contentful";
import { ContentfulDataT } from "types";
import { createCacheKey } from "lib/cache-keys";
import { handleApiError, HttpError } from "./_utils/errors";

// Per-UMIP entries are effectively immutable once the proposal lands. A long
// server-side TTL means at most one Contentful call per UMIP per hour, no
// matter how many tabs are open across all clients. Misses get a shorter TTL
// so we don't keep hammering Contentful for numbers that don't exist there.
const HIT_TTL_SECONDS = 60 * 60;
const MISS_TTL_SECONDS = 5 * 60;

// Cap to defend against pathological clients. Real callers send <= ~50.
const MAX_NUMBERS_PER_REQUEST = 200;

const SPACE_ID =
  process.env.CONTENTFUL_SPACE_ID ??
  process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN =
  process.env.CONTENTFUL_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const DISABLE_REDIS = process.env.DISABLE_REDIS === "true";

const contentfulClient =
  SPACE_ID && ACCESS_TOKEN
    ? contentful.createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN })
    : undefined;

let redis: Redis | undefined;
function getRedis(): Redis | null {
  if (DISABLE_REDIS) return null;
  redis ??= Redis.fromEnv();
  return redis;
}

function cacheKeyForNumber(n: number): string {
  return createCacheKey(`umip:metadata:${n}`);
}

// Sentinel stored when Contentful had no entry for this UMIP number.
const MISS_SENTINEL = "__miss__";
type CachedEntry = ContentfulDataT | typeof MISS_SENTINEL;

function parseNumbers(raw: string | string[] | undefined): number[] {
  if (!raw) {
    throw new HttpError({ statusCode: 400, msg: "Missing 'numbers' query param" });
  }
  const flat = Array.isArray(raw) ? raw.join(",") : raw;
  const parsed = flat
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s));

  if (parsed.length === 0) {
    throw new HttpError({ statusCode: 400, msg: "'numbers' is empty" });
  }
  if (parsed.length > MAX_NUMBERS_PER_REQUEST) {
    throw new HttpError({
      statusCode: 400,
      msg: `'numbers' exceeds max of ${MAX_NUMBERS_PER_REQUEST}`,
    });
  }
  if (parsed.some((n) => !Number.isInteger(n) || n < 0)) {
    throw new HttpError({
      statusCode: 400,
      msg: "'numbers' must be a comma-separated list of non-negative integers",
    });
  }
  return Array.from(new Set(parsed));
}

async function fetchFromContentful(
  numbers: number[]
): Promise<Record<number, ContentfulDataT>> {
  if (!contentfulClient || numbers.length === 0) return {};

  const entries = await contentfulClient.getEntries<ContentfulDataT>({
    content_type: "umip",
    "fields.number[in]": numbers.join(","),
  });

  const byNumber: Record<number, ContentfulDataT> = {};
  for (const item of entries.items) {
    byNumber[item.fields.number] = item.fields;
  }
  return byNumber;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!contentfulClient) {
      throw new HttpError({
        statusCode: 503,
        msg: "Contentful is not configured on this server",
      });
    }

    const numbers = parseNumbers(req.query.numbers);
    const result: Record<number, ContentfulDataT> = {};
    const redisClient = getRedis();

    // 1. Read cache for everything we know about
    let toFetch = numbers;
    if (redisClient) {
      const keys = numbers.map(cacheKeyForNumber);
      const cached = await redisClient.mget<(CachedEntry | null)[]>(...keys);
      const missing: number[] = [];
      cached.forEach((value, i) => {
        const n = numbers[i];
        if (value === null) {
          missing.push(n);
        } else if (value !== MISS_SENTINEL) {
          result[n] = value;
        }
        // MISS_SENTINEL: leave out of result, do not refetch
      });
      toFetch = missing;
    }

    // 2. Fetch missing from Contentful (single batched query)
    if (toFetch.length > 0) {
      const fetched = await fetchFromContentful(toFetch);
      for (const n of toFetch) {
        const entry = fetched[n];
        if (entry) result[n] = entry;
      }

      // 3. Write back to cache
      if (redisClient) {
        const pipeline = redisClient.pipeline();
        for (const n of toFetch) {
          const entry = fetched[n];
          if (entry) {
            pipeline.set(cacheKeyForNumber(n), entry, { ex: HIT_TTL_SECONDS });
          } else {
            pipeline.set(cacheKeyForNumber(n), MISS_SENTINEL, {
              ex: MISS_TTL_SECONDS,
            });
          }
        }
        await pipeline.exec();
      }
    }

    // CDN cache: edges absorb identical query strings within the window so
    // the function itself doesn't even run for repeat hits.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(error, res);
  }
}
