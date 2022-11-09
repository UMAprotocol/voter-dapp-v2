import { discordLink, earlyRequestMagicNumber } from "constant";
import approvedIdentifiers from "data/approvedIdentifiersTable";
import { checkIfIsPolymarket } from "helpers";
import { ContentfulDataT, TransactionHashT, VoteMetaDataT } from "types";

/** Finds a title and description, and UMIP link (if it exists) for a decodedIdentifier.
 *
 * There are 3 different sources of this data, depending on the decodedIdentifier type:
 *
 * 1. For UMIPs, the title, description and UMIP link come from Contentful.
 * 2. For requests for approved price identifiers, the title, description, and UMIP link come from the hard-coded `approvedIdentifiersTable` json file.
 * 3. For requests from Polymarket, the title and description come from the decodedIdentifier's ancillary data (note that there is no UMIP link here).
 */
export function getVoteMetaData(
  decodedIdentifier: string,
  decodedAncillaryData: string,
  transactionHash: TransactionHashT,
  umipDataFromContentful: ContentfulDataT | undefined
): VoteMetaDataT {
  // rolled votes have no transaction hash — the value for `transactionHash` will be `"rolled"`
  const isRolled = transactionHash === "rolled";
  // if we are dealing with a UMIP, get the title, description and UMIP url from Contentful
  const isUmip = decodedIdentifier.includes("Admin");
  if (isUmip) {
    const title = umipDataFromContentful?.title ?? decodedIdentifier;
    const description =
      umipDataFromContentful?.description ??
      "No description was found for this UMIP.";
    const umipUrl = umipDataFromContentful?.umipLink;
    const umipNumber = getUmipNumber(decodedIdentifier);
    const links = makeVoteLinks(transactionHash, umipNumber);
    const options = makeVoteOptions("umip");
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
      isRolled,
    };
  }

  const isPolymarket = checkIfIsPolymarket(
    decodedIdentifier,
    decodedAncillaryData
  );
  if (isPolymarket) {
    const ancillaryDataTitle = getTitleFromAncillaryData(decodedAncillaryData);
    const ancillaryDataDescription =
      getDescriptionFromAncillaryData(decodedAncillaryData);
    const title = ancillaryDataTitle ?? decodedIdentifier;
    const description =
      ancillaryDataDescription ?? "No description was found for this request.";
    const links = makeVoteLinks(transactionHash);
    const isYesNoQuery = decodedIdentifier === "YES_OR_NO_QUERY";
    const options = isYesNoQuery ? makeVoteOptions("yesNoQuery") : undefined;
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
      isRolled,
    };
  }

  // if we are dealing with a request for an approved price identifier, get the title, description and UMIP url from the hard-coded approvedIdentifiersTable json file
  // we know we are dealing with a request for an approved price identifier if the decodedIdentifier matches an approved identifier
  const identifierDetails = approvedIdentifiers[decodedIdentifier];
  const isApprovedIdentifier = Boolean(identifierDetails);
  if (isApprovedIdentifier) {
    const title = identifierDetails.identifier;
    const description = identifierDetails.summary;
    const umipUrl = identifierDetails.umipLink.url;
    const umipNumber = getUmipNumber(identifierDetails.umipLink.number);
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
      isRolled,
    };
  }

  // if all checks fail, return with generic values generated from the data we have
  return {
    title: decodedIdentifier,
    description: "No description found for this request.",
    umipUrl: undefined,
    umipNumber: undefined,
    links: makeVoteLinks(transactionHash),
    options: undefined,
    origin: "UMA",
    isGovernance: false,
    discordLink,
    isRolled,
  };
}

function getTitleFromAncillaryData(
  decodedAncillaryData: string,
  titleIdentifier = "title:",
  descriptionIdentifier = "description:"
) {
  const start = decodedAncillaryData.indexOf(titleIdentifier);
  const end =
    decodedAncillaryData.indexOf(descriptionIdentifier) ??
    decodedAncillaryData.length;

  if (start === -1) {
    return undefined;
  }

  const title = decodedAncillaryData
    .substring(start + titleIdentifier.length, end)
    .trim();
  // remove the trailing comma if it exists (from Polymarket)
  return title.endsWith(",") ? title.slice(0, -1) : title;
}

function getDescriptionFromAncillaryData(
  decodedAncillaryData: string,
  descriptionIdentifier = "description:"
) {
  if (!decodedAncillaryData) {
    return undefined;
  }
  const start = decodedAncillaryData.indexOf(descriptionIdentifier);
  const end = decodedAncillaryData.length;

  if (start === -1) {
    return undefined;
  }

  return decodedAncillaryData.substring(
    start + descriptionIdentifier.length,
    end
  );
}

function getUmipNumber(umipOrAdmin: string | undefined) {
  if (!umipOrAdmin) return undefined;

  const [, numberAsString] = umipOrAdmin.split(" ");

  const asNumber = Number(numberAsString);
  if (isNaN(asNumber)) return undefined;

  return asNumber;
}

function makeVoteOptions(voteType: "umip" | "yesNoQuery") {
  const yesNoQueryVoteOptions = [
    { label: "Yes", value: "0", secondaryLabel: "p1" },
    { label: "No", value: "1", secondaryLabel: "p2" },
    { label: "Unknown", value: "0.5", secondaryLabel: "p3" },
    {
      label: "Early request",
      value: earlyRequestMagicNumber,
      secondaryLabel: "p4",
    },
  ];
  const umipVoteOptions = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  switch (voteType) {
    case "umip":
      return umipVoteOptions;
    case "yesNoQuery":
      return yesNoQueryVoteOptions;
  }
}

function makeVoteLinks(transactionHash: TransactionHashT, umipNumber?: number) {
  const links = [];

  if (transactionHash !== "rolled" && transactionHash !== "v1") {
    links.push({
      label: "Request transaction",
      href: `https://goerli.etherscan.io/tx/${transactionHash}`,
    });
  }

  if (umipNumber) {
    links.push({
      label: `UMIP ${umipNumber}`,
      href: `https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-${umipNumber}.md`,
    });
  }

  return links;
}
