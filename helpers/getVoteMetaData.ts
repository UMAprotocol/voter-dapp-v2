import { UmipDataFromContentfulT, VoteMetaDataT } from "types/global";
import approvedIdentifiers from "data/approvedIdentifiersTable.json";
import { discordLink } from "constants/discordLink";

/** Finds a title and description, and UMIP link (if it exists) for a decodedIdentifier.
 *
 * There are 3 different sources of this data, depending on the decodedIdentifier type:
 *
 * 1. For UMIPs, the title, description and UMIP link come from Contentful.
 * 2. For requests for approved price identifiers, the title, description, and UMIP link come from the hard-coded `approvedIdentifiersTable` json file.
 * 3. For requests from Polymarket, the title and description come from the decodedIdentifier's ancillary data (note that there is no UMIP link here).
 */
export default function getVoteMetaData(
  decodedIdentifier: string,
  decodedAncillaryData: string,
  transactionHash: string,
  umipDataFromContentful: UmipDataFromContentfulT | undefined
): VoteMetaDataT {
  // if we are dealing with a UMIP, get the title, description and UMIP url from Contentful
  const isUmip = decodedIdentifier.includes("Admin");
  if (isUmip) {
    const title = umipDataFromContentful?.title ?? decodedIdentifier;
    const description = umipDataFromContentful?.description ?? "No description was found for this UMIP.";
    const umipUrl = umipDataFromContentful?.umipLink;
    const umipNumber = getUmipNumber(decodedIdentifier);
    const links = makeVoteLinks(transactionHash, umipNumber);
    const options = makeVoteOptions({ isUmip });
    return {
      title,
      description,
      umipUrl,
      umipNumber,
      links,
      options,
      origin: "UMA",
      isGovernance: true,
      discordLink,
    };
  }

  // if we are dealing with a request for an approved price identifier, get the title, description and UMIP url from the hard-coded approvedIdentifiersTable json file
  // we know we are dealing with a request for an approved price identifier if the decodedIdentifier matches an approved identifier's title
  const identifierDetails = approvedIdentifiers.find((id) => decodedIdentifier === id.title);
  const isApprovedIdentifier =
    Boolean(identifierDetails) &&
    // `YES_OR_NO_QUERY` is a special case, because it is the only approved identifier that Polymarket uses
    // we should therefore treat it as a Polymarket request instead
    decodedIdentifier !== "YES_OR_NO_QUERY";
  if (isApprovedIdentifier) {
    const title = identifierDetails?.title ?? decodedIdentifier;
    const description = identifierDetails?.summary ?? "No description was found for this request.";
    const umipUrl = identifierDetails?.umipLink.url;
    const umipNumber = getUmipNumber(identifierDetails?.umipLink.number);
    const links = makeVoteLinks(transactionHash, umipNumber);
    return {
      title,
      description,
      umipUrl,
      umipNumber,
      links,
      options: undefined,
      origin: "UMA",
      isGovernance: false,
      discordLink,
    };
  }

  // if the previous checks fail, we assume we are dealing with a Polymarket request
  // note that `umipUrl` is undefined in this case, as there is no UMIP to link to for this type of request

  const ancillaryDataTitle = getTitleFromAncillaryData(decodedAncillaryData);
  const ancillaryDataDescription = getDescriptionFromAncillaryData(decodedAncillaryData);
  const title = ancillaryDataTitle ?? decodedIdentifier;
  const description = ancillaryDataDescription ?? "No description was found for this request.";
  const links = makeVoteLinks(transactionHash);
  const isYesNoQuery = decodedIdentifier === "YES_OR_NO_QUERY";
  const options = makeVoteOptions({ isYesNoQuery });
  return {
    title,
    description,
    links,
    options,
    umipUrl: undefined,
    umipNumber: undefined,
    origin: "Polymarket",
    isGovernance: false,
    discordLink,
  };
}

function getTitleFromAncillaryData(
  decodedAncillaryData: string,
  titleIdentifier = "title:",
  descriptionIdentifier = "description:"
) {
  if (!decodedAncillaryData) {
    return null;
  }
  const start = decodedAncillaryData.indexOf(titleIdentifier);
  const end = decodedAncillaryData.indexOf(descriptionIdentifier) ?? decodedAncillaryData.length;

  if (start === -1) {
    return null;
  }

  const title = decodedAncillaryData.substring(start + titleIdentifier.length, end).trim();
  // remove the trailing comma if it exists (from Polymarket)
  return title.endsWith(",") ? title.slice(0, -1) : title;
}

function getDescriptionFromAncillaryData(decodedAncillaryData: string, descriptionIdentifier = "description:") {
  if (!decodedAncillaryData) {
    return null;
  }
  const start = decodedAncillaryData.indexOf(descriptionIdentifier);
  const end = decodedAncillaryData.length;

  if (start === -1) {
    return null;
  }

  return decodedAncillaryData.substring(start + descriptionIdentifier.length, end);
}

function getUmipNumber(umipOrAdmin: string | undefined) {
  if (!umipOrAdmin) return undefined;

  const [, numberAsString] = umipOrAdmin.split(" ");

  const asNumber = Number(numberAsString);
  if (isNaN(asNumber)) return undefined;

  return asNumber;
}

function makeVoteOptions({ isUmip = false, isYesNoQuery = false }: { isUmip?: boolean; isYesNoQuery?: boolean } = {}) {
  if (isUmip) {
    return [
      { label: "Yes", value: "1" },
      { label: "No", value: "0" },
    ];
  }

  const earlyRequestMagicNumber = "-57896044618658097711785492504343953926634992332820282019728.792003956564819968";
  if (isYesNoQuery) {
    return [
      { label: "Yes", value: "0", secondaryLabel: "p1" },
      { label: "No", value: "1", secondaryLabel: "p2" },
      { label: "Unknown", value: "0.5", secondaryLabel: "p3" },
      { label: "Early request", value: earlyRequestMagicNumber, secondaryLabel: "p4" },
    ];
  }

  return undefined;
}

function makeVoteLinks(transactionHash: string, umipNumber?: number) {
  const links = [
    {
      label: "Vote transaction",
      href: `https://etherscan.io/tx/${transactionHash}`,
    },
    {
      label: "Optimistic Oracle UI",
      href: `https://oracle.umaproject.org/request?requester=${transactionHash}`,
    },
  ];

  if (umipNumber) {
    links.push({
      label: `UMIP ${umipNumber}`,
      href: `https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-${umipNumber}.md`,
    });
  }

  return links;
}
