import { useQuery } from "@tanstack/react-query";
import * as contentful from "contentful";
import { PriceRequestT, PriceRequestWithUmipDataFromContentfulT, UmipDataFromContentfulT } from "types/global";

const space = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? "";
const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN ?? "";

const contentfulClient = contentful.createClient({
  space,
  accessToken,
});

async function getUmipDataFromContentful(adminProposalNumbers: number[]) {
  if (adminProposalNumbers.length === 0) return undefined;

  try {
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
  } catch (e) {
    console.error(e);
  }
}

export default function useWithUmipDataFromContentful(votes: PriceRequestT[]) {
  const adminProposalNumbers = votes
    .map(({ decodedIdentifier }) => getAdminProposalNumber(decodedIdentifier))
    .filter((number): number is number => Boolean(number));

  const { isLoading, isError, data, error } = useQuery(
    ["withUmipDataFromContentful"],
    () => getUmipDataFromContentful(adminProposalNumbers),
    {
      enabled: adminProposalNumbers?.length > 0,
    }
  );

  const withUmipDataFromContentful = votes.map((vote) => {
    const adminProposalNumberForVote = getAdminProposalNumber(vote.decodedIdentifier) ?? "";
    const umipDataFromContentful = data?.[adminProposalNumberForVote];
    return {
      ...vote,
      umipDataFromContentful,
    } as PriceRequestWithUmipDataFromContentfulT;
  });

  return {
    withUmipDataFromContentful,
    withUmipDataFromContentfulIsLoading: isLoading,
    withUmipDataFromContentfulIsError: isError,
    withUmipDataFromContentfulError: error,
  };
}

function getAdminProposalNumber(decodedIdentifier: string) {
  const adminProposalNumber = Number(decodedIdentifier.split(" ")[1]);
  if (!isNaN(adminProposalNumber)) return adminProposalNumber;
  return null;
}
