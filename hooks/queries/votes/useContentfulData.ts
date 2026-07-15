import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey, oneMinute } from "constant";
import * as contentful from "contentful";
import { config } from "helpers/config";
import { warnOnce } from "helpers/util/log";
import { useActiveVotes, usePastVotes, useUpcomingVotes } from "hooks";
import { ContentfulDataByKeyT, ContentfulDataT, UniqueKeyT } from "types";

const { contentfulSpace, contentfulAccessToken } = config;

const contentfulClient =
  contentfulSpace && contentfulAccessToken
    ? contentful.createClient({
        space: contentfulSpace,
        accessToken: contentfulAccessToken,
      })
    : undefined;

async function getContentfulData(
  adminProposalNumbersByKey: Record<UniqueKeyT, number>
) {
  if (!contentfulClient) throw new Error("Contentful API not available");

  const adminProposalNumbers = Object.values(adminProposalNumbersByKey);
  if (adminProposalNumbers.length === 0) return {};

  const numberFieldsString = adminProposalNumbers.join(",");

  const entries = await contentfulClient.getEntries<ContentfulDataT>({
    content_type: "umip",
    "fields.number[in]": numberFieldsString,
  });

  const fields = entries.items.map(({ fields }) => fields);
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
    enabled:
      !!contentfulClient && Object.keys(adminProposalNumbersByKey).length > 0,
    // contentful only enriches admin votes with CMS descriptions — a failure
    // (e.g. a stale access token) must not raise the app-wide "error fetching
    // vote data" banner, especially since this query polls every minute
    onError: (error) =>
      warnOnce("contentful", "Error fetching UMIP data from contentful:", error),
  });

  return queryResult;
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
