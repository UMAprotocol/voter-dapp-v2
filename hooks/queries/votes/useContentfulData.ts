import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey, oneMinute } from "constant";
import * as contentful from "contentful";
import {
  useActiveVotes,
  useHandleError,
  usePastVotes,
  useUpcomingVotes,
} from "hooks";
import { ContentfulDataByKeyT, ContentfulDataT, UniqueKeyT } from "types";
import { config } from "helpers/config";

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
  const {
    data: { activeVotes },
  } = useActiveVotes();
  const {
    data: { upcomingVotes },
  } = useUpcomingVotes();
  const { data: pastVotes } = usePastVotes();
  const { onError } = useHandleError({ isDataFetching: true });

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
    queryKey: [contentfulDataKey, activeVotes, upcomingVotes, pastVotes],
    queryFn: () => getContentfulData(adminProposalNumbersByKey),
    refetchInterval: oneMinute,
    enabled: !!contentfulClient,
    initialData: {},
    onError,
  });

  return queryResult;
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
