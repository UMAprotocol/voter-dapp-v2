import { discordLink } from "constant";
import approvedIdentifiers from "data/approvedIdentifiersTable";
import { utils } from "ethers";
import { checkIfIsPolymarket, maybeMakePolymarketOptions } from "helpers";
import { ContentfulDataT, VoteMetaDataT } from "types";

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
  umipDataFromContentful: ContentfulDataT | undefined
): VoteMetaDataT {
  const isAssertion = ["assertionId:", "ooAsserter:", "childChainId:"].every(
    (lookup) => decodedAncillaryData.includes(lookup)
  );
  if (isAssertion) {
    const assertionData = parseAssertionAncillaryData(decodedAncillaryData);
    const description = makeAssertionDescription(assertionData);
    return {
      title: decodedIdentifier,
      description,
      umipOrUppLink: {
        label: "UMIP-170",
        href: "https://github.com/UMAprotocol/UMIPs/blob/7e4eadb309c8e38d540bdf6f39cee81a3e48d260/UMIPs/umip-170.md",
      },
      umipOrUppNumber: "umip-170",
      options: makeAssertionOptions(),
      origin: "UMA" as const,
      isGovernance: false,
      discordLink,
      isAssertion: true,
      ...assertionData,
    };
  }
  // if we are dealing with a UMIP, get the title, description and UMIP url from Contentful
  const isUmip = decodedIdentifier.includes("Admin");
  if (isUmip) {
    const title = umipDataFromContentful?.title ?? decodedIdentifier;
    const description =
      umipDataFromContentful?.description ??
      "No description was found for this UMIP.";
    const umipOrUppUrl = umipDataFromContentful?.umipLink;
    const umipOrUppNumber = getUmipOrUppNumberFromUrl(umipOrUppUrl);
    const options = makeVoteOptions();
    return {
      title,
      description,
      umipOrUppLink: maybeMakeUmipOrUppLink(umipOrUppNumber, umipOrUppUrl),
      umipOrUppNumber,
      options,
      origin: "UMA",
      isGovernance: true,
      discordLink,
      isAssertion: false,
    };
  }

  const isAcross = decodedIdentifier === "ACROSS-V2";
  if (isAcross) {
    const title = "Across V2";
    const description = `Across is an optimistic insured bridge that relies on a decentralized group of relayers to fulfill user deposit requests from EVM to EVM networks. Relayer funds are insured by liquidity providers in a single pool on Ethereum and refunds are processed via the UMA Optimistic Oracle. [Learn more.](https://docs.across.to/)`;
    const umipOrUppUrl =
      "https://github.com/UMAprotocol/UMIPs/blob/448375e1b9d2bd24dfd0627805ef6a7c2d72f74f/UMIPs/umip-157.md";
    const umipOrUppNumber = "umip-157";
    const options = makeVoteOptions();

    return {
      title,
      description,
      umipOrUppLink: maybeMakeUmipOrUppLink(umipOrUppNumber, umipOrUppUrl),
      umipOrUppNumber,
      options,
      origin: "Across",
      isGovernance: false,
      discordLink,
      isAssertion: false,
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
    const isYesNoQuery = decodedIdentifier === "YES_OR_NO_QUERY";
    const options = isYesNoQuery
      ? maybeMakePolymarketOptions(decodedAncillaryData)
      : undefined;
    const umipOrUppNumber = isYesNoQuery ? "umip-107" : undefined;
    const umipOrUppUrl = isYesNoQuery
      ? "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md"
      : undefined;
    return {
      title,
      description,
      options,
      umipOrUppLink: maybeMakeUmipOrUppLink(umipOrUppNumber, umipOrUppUrl),
      umipOrUppNumber,
      origin: "Polymarket",
      isGovernance: false,
      discordLink,
      isAssertion: false,
    };
  }

  // if we are dealing with a request for an approved price identifier, get the title, description and UMIP url from the hard-coded approvedIdentifiersTable json file
  // we know we are dealing with a request for an approved price identifier if the decodedIdentifier matches an approved identifier
  const identifierDetails = approvedIdentifiers[decodedIdentifier];
  const isApprovedIdentifier = Boolean(identifierDetails);
  if (isApprovedIdentifier) {
    const title = identifierDetails.identifier;
    const description = identifierDetails.summary;
    const umipOrUppUrl = identifierDetails.umipLink.url;
    const umipOrUppNumber = identifierDetails.umipLink.number;
    return {
      title,
      description,
      umipOrUppLink: maybeMakeUmipOrUppLink(umipOrUppNumber, umipOrUppUrl),
      umipOrUppNumber,
      options: undefined,
      origin: "UMA",
      isGovernance: false,
      discordLink,
      isAssertion: false,
    };
  }

  // if all checks fail, return with generic values generated from the data we have
  return {
    title: decodedIdentifier,
    description: "No description found for this request.",
    umipOrUppLink: undefined,
    umipOrUppNumber: undefined,
    options: undefined,
    origin: "UMA",
    isGovernance: false,
    discordLink,
    isAssertion: false,
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

function maybeMakeUmipOrUppLink(
  umipOrUppNumber?: string | undefined,
  umipOrUppUrl?: string | undefined
) {
  if (!umipOrUppNumber || !umipOrUppUrl) return;

  return {
    label: umipOrUppNumber.toUpperCase(),
    href: umipOrUppUrl,
  };
}

function getUmipOrUppNumberFromUrl(url: string | undefined) {
  if (!url) return;

  const isUmip = url.includes("UMIPs/umip");
  const isUpp = url.includes("/UPPs/upp");

  if (isUmip) {
    const umipNumber = url.split("umip-")[1].split(".")[0];
    return `umip-${umipNumber}`;
  }

  if (isUpp) {
    const uppNumber = url.split("upp-")[1].split(".")[0];
    return `upp-${uppNumber}`;
  }
}

function makeAssertionOptions() {
  return [
    { label: "True", value: "1" },
    { label: "False", value: "0" },
  ];
}

function parseAssertionAncillaryData(decodedAncillaryData: string) {
  const regex =
    /^(?=.*assertionId:([a-f0-9]+))(?=.*ooAsserter:([a-f0-9]+))(?=.*childChainId:(\d+)).*$/;
  const match = decodedAncillaryData.match(regex);

  return {
    assertionId: match?.[1] && `0x${match?.[1]}`,
    assertionAsserter: match?.[2] && utils.getAddress(`0x${match[2]}`),
    assertionChildChainId: match?.[3] ? Number(match[3]) : undefined,
  };
}

function makeAssertionDescription(
  parsedAncillaryData: ReturnType<typeof parseAssertionAncillaryData>
) {
  const { assertionId, assertionChildChainId } = parsedAncillaryData;

  return assertionId
    ? `${assertionId ? `Assertion ID: ${assertionId}  ` : ""}  
${assertionChildChainId ? `Chain ID: ${assertionChildChainId}` : ""}`
    : "";
}
