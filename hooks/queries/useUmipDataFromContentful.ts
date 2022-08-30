import { useQuery } from "@tanstack/react-query";
import * as contentful from "contentful";
import { ContentfulDataByProposalNumberT, PriceRequestT, UmipDataFromContentfulT } from "types/global";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? "";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN ?? "";

const contentfulClient = contentful.createClient({
  space,
  accessToken,
});

async function getUmipDataFromContentful(adminProposalNumbers: number[]) {
  if (adminProposalNumbers.length === 0) return {};

  const numberFieldsString = adminProposalNumbers.join(",");

  const entries = await contentfulClient.getEntries<UmipDataFromContentfulT>({
    content_type: "umip",
    "fields.number[in]": numberFieldsString,
  });

  const fields = entries.items.map(({ fields }) => fields);
  const fieldsToNumbers: Record<string, UmipDataFromContentfulT> = {};

  fields.forEach((field) => {
    fieldsToNumbers[field.number] = field;
  });

  return fieldsToNumbers;
}

export default function useUmipDataFromContentful(votes: PriceRequestT[]) {
  const adminProposalNumbers =
    votes
      ?.map(({ decodedIdentifier }) => getAdminProposalNumber(decodedIdentifier))
      ?.filter((number): number is number => Boolean(number)) ?? [];

  const { isLoading, isError, data, error } = useQuery(
    ["umipDataFromContentful"],
    () => getUmipDataFromContentful(adminProposalNumbers),
    {
      enabled: adminProposalNumbers?.length > 0,
    }
  );

  const umipDataFromContentful: ContentfulDataByProposalNumberT = data ?? {};

  return {
    umipDataFromContentful,
    umipDataFromContentfulIsLoading: isLoading,
    umipDataFromContentfulIsError: isError,
    umipDataFromContentfulError: error,
  };
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
