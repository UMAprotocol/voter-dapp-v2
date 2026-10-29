import * as contentful from "contentful";
import { getAdminProposalNumber } from "helpers/voting/getVoteMetaData";
import { ContentfulDataT } from "types";

// the access token lives server-side only — a NEXT_PUBLIC_ token ships in the
// client bundle where anyone can extract it. The NEXT_PUBLIC_-prefixed names
// are accepted as a fallback so existing deployments keep working until the
// env vars are renamed.
const space =
  process.env.CONTENTFUL_SPACE_ID ??
  process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const accessToken =
  process.env.CONTENTFUL_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;

export const contentfulClient =
  space && accessToken
    ? contentful.createClient({ space, accessToken })
    : undefined;

export async function getUmipEntries(
  numbers: number[]
): Promise<ContentfulDataT[]> {
  if (!contentfulClient || numbers.length === 0) return [];
  const entries = await contentfulClient.getEntries<ContentfulDataT>({
    content_type: "umip",
    "fields.number[in]": numbers.join(","),
  });
  return entries.items.map(({ fields }) => fields);
}

/**
 * Governance vote titles come from Contentful, and Discord threads are keyed by
 * title, so server-side jobs need the same UMIP data the frontend uses.
 * Failures degrade to no data (the identifier-based "N/A" title).
 */
export async function getUmipDataByIdentifier(
  decodedIdentifiers: string[]
): Promise<Map<string, ContentfulDataT>> {
  const numberByIdentifier = new Map<string, number>();
  for (const decodedIdentifier of decodedIdentifiers) {
    const adminProposalNumber = getAdminProposalNumber(decodedIdentifier);
    if (adminProposalNumber !== null) {
      numberByIdentifier.set(decodedIdentifier, adminProposalNumber);
    }
  }

  const umipDataByIdentifier = new Map<string, ContentfulDataT>();
  if (numberByIdentifier.size === 0) return umipDataByIdentifier;

  try {
    const entries = await getUmipEntries([
      ...new Set(numberByIdentifier.values()),
    ]);
    for (const [decodedIdentifier, number] of numberByIdentifier) {
      const entry = entries.find((entry) => entry.number === number);
      if (entry) umipDataByIdentifier.set(decodedIdentifier, entry);
    }
  } catch (error) {
    console.error("[contentful] Fetching UMIP data failed", error);
  }
  return umipDataByIdentifier;
}
