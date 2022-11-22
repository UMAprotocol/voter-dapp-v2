import { discordLink } from "constant";
import approvedIdentifiers from "data/approvedIdentifiersTable";
import { checkIfIsPolymarket, maybeMakePolymarketOptions } from "helpers";
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
    const umipNumber = umipDataFromContentful?.number;
    const links = makeVoteLinks(transactionHash, umipNumber, umipUrl);
    const options = makeVoteOptions();
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

  const isAcross = decodedIdentifier === "ACROSS-V2";
  if (isAcross) {
    const title = "Across V2";
    const description = `Across is an optimistic insured bridge that relies on a decentralized group of relayers to fulfill user deposit requests from EVM to EVM networks. Relayer funds are insured by liquidity providers in a single pool on Ethereum and refunds are processed via the UMA Optimistic Oracle. [Learn more.](https://docs.across.to/)`;
    const umipUrl =
      "https://github.com/UMAprotocol/UMIPs/blob/448375e1b9d2bd24dfd0627805ef6a7c2d72f74f/UMIPs/umip-157.md";
    const umipNumber = 157;
    const links = makeVoteLinks(transactionHash, umipNumber, umipUrl);
    const options = makeVoteOptions();

    return {
      title,
      description,
      umipUrl,
      umipNumber,
      links,
      options,
      origin: "Across",
      isGovernance: false,
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
    const options = isYesNoQuery
      ? maybeMakePolymarketOptions(decodedAncillaryData)
      : undefined;
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
    const umipNumber = Number(identifierDetails.umipLink.number);
    const links = makeVoteLinks(transactionHash, umipNumber, umipUrl);
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

function makeVoteOptions() {
  return [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];
}

function makeVoteLinks(
  transactionHash: TransactionHashT,
  umipNumber?: number,
  umipUrl?: string
) {
  const links = [];

  if (transactionHash !== "rolled" && transactionHash !== "v1") {
    links.push({
      label: "Request transaction",
      href: `https://goerli.etherscan.io/tx/${transactionHash}`,
    });
  }

  if (umipNumber && umipUrl) {
    links.push({
      label: `UMIP ${umipNumber}`,
      href: umipUrl,
    });
  }

  return links;
}
