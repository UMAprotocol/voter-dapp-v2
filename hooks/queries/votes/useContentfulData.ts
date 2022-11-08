import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey } from "constant";
import * as contentful from "contentful";
import {
  useActiveVotes,
  useHandleError,
  usePastVotes,
  useUpcomingVotes,
} from "hooks";
import { ContentfulDataByKeyT, ContentfulDataT, UniqueKeyT } from "types";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? "";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN ?? "";

const contentfulClient = contentful.createClient({
  space,
  accessToken,
});

async function getContentfulData(
  adminProposalNumbersByKey: Record<UniqueKeyT, number>
) {
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

  const queryResult = useQuery(
    [contentfulDataKey, activeVotes, upcomingVotes, pastVotes],
    () => getContentfulData(adminProposalNumbersByKey),
    {
      refetchInterval: (data) => (data ? false : 100),
      initialData: {},
      onError,
    }
  );

  return queryResult;
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
