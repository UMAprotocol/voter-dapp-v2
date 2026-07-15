import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey, oneMinute } from "constant";
import { warnOnce } from "helpers/util/log";
import { useActiveVotes, usePastVotes, useUpcomingVotes } from "hooks";
import { ContentfulUmipsResponse } from "pages/api/contentful-umips";
import { ContentfulDataByKeyT, UniqueKeyT } from "types";

// contentful is queried through our own API route so the access token stays
// server-side instead of shipping in the client bundle
async function getContentfulData(
  adminProposalNumbersByKey: Record<UniqueKeyT, number>
) {
  const adminProposalNumbers = Object.values(adminProposalNumbersByKey);
  if (adminProposalNumbers.length === 0) return {};

  // sorted so equivalent requests share a CDN cache entry
  const numberFieldsString = adminProposalNumbers
    .slice()
    .sort((a, b) => a - b)
    .join(",");

  const response = await fetch(
    `/api/contentful-umips?numbers=${numberFieldsString}`
  );
  if (!response.ok) {
    throw new Error(`Fetching UMIP data failed with status ${response.status}`);
  }
  const { entries } = (await response.json()) as ContentfulUmipsResponse;

  const fields = entries;
  const contentfulDataByKey: ContentfulDataByKeyT = {};

  fields.forEach((field) => {
    const voteKeyForNumber = Object.keys(adminProposalNumbersByKey).find(
      (key) => adminProposalNumbersByKey[key] === field.number
    );
    if (voteKeyForNumber) {
      contentfulDataByKey[voteKeyForNumber] = field;
    }
  });

  return contentfulDataByKey;
}

export function useContentfulData() {
  const { data: activeVotes } = useActiveVotes();
  const { data: upcomingVotes } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();

  const adminProposalNumbersByKey: Record<UniqueKeyT, number> = {};

  for (const [uniqueKey, { decodedIdentifier }] of Object.entries({
    ...activeVotes,
    ...upcomingVotes,
    ...pastVotes,
  })) {
    const adminProposalNumber = getAdminProposalNumber(decodedIdentifier);
    if (adminProposalNumber) {
      adminProposalNumbersByKey[uniqueKey] = adminProposalNumber;
    }
  }

  const queryResult = useQuery({
    // key only on the derived proposal numbers — keying on the full vote maps
    // serializes the entire vote history on every render just to compare keys
    // (react-query hashes object keys deterministically)
    queryKey: [contentfulDataKey, adminProposalNumbersByKey],
    queryFn: () => getContentfulData(adminProposalNumbersByKey),
    refetchInterval: oneMinute,
    enabled: Object.keys(adminProposalNumbersByKey).length > 0,
    // contentful only enriches admin votes with CMS descriptions — a failure
    // (e.g. a stale access token) must not raise the app-wide "error fetching
    // vote data" banner, especially since this query polls every minute
    onError: (error) =>
      warnOnce(
        "contentful",
        "Error fetching UMIP data from contentful:",
        error
      ),
  });

  return queryResult;
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
