import { useQuery } from "@tanstack/react-query";
import { contentfulDataKey, oneMinute } from "constant";
import {
  useActiveVotes,
  useHandleError,
  usePastVotes,
  useUpcomingVotes,
} from "hooks";
import { ContentfulDataByKeyT, ContentfulDataT, UniqueKeyT } from "types";

async function getContentfulData(
  adminProposalNumbersByKey: Record<UniqueKeyT, number>
): Promise<ContentfulDataByKeyT> {
  const numbers = Array.from(new Set(Object.values(adminProposalNumbersByKey)));
  if (numbers.length === 0) return {};

  const url = `/api/umip-metadata?numbers=${numbers.join(",")}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`UMIP metadata request failed: ${response.status}`);
  }
  const byNumber = (await response.json()) as Record<string, ContentfulDataT>;

  const byKey: ContentfulDataByKeyT = {};
  for (const [uniqueKey, number] of Object.entries(adminProposalNumbersByKey)) {
    const entry = byNumber[number];
    if (entry) byKey[uniqueKey] = entry;
  }
  return byKey;
}

export function useContentfulData() {
  const { data: activeVotes } = useActiveVotes();
  const { data: upcomingVotes } = useUpcomingVotes();
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
    queryKey: [
      contentfulDataKey,
      activeVotes,
      upcomingVotes,
      pastVotes,
      adminProposalNumbersByKey,
    ],
    queryFn: () => getContentfulData(adminProposalNumbersByKey),
    refetchInterval: oneMinute,
    onError,
  });

  return queryResult;
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
