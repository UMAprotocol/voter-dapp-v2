import { UmipDataFromContentfulT } from "types/global";
import approvedIdentifiers from "data/approvedIdentifiersTable.json";
import { decodeHexString } from "./decodeHexString";

type RequestMetaData = {
  title: string;
  description: string;
  umipUrl?: string;
};

/** Finds a title and description, and UMIP link (if it exists) for a decodedIdentifier.
 *
 * There are 3 different sources of this data, depending on the decodedIdentifier type:
 *
 * 1. For UMIPs, the title, description and UMIP link come from Contentful.
 * 2. For requests for approved price identifiers, the title, description, and UMIP link come from the hard-coded `approvedIdentifiersTable` json file.
 * 3. For requests from Polymarket, the title and description come from the decodedIdentifier's ancillary data (note that there is no UMIP link here).
 */
export function getRequestMetaData(
  ancillaryData: string,
  decodedIdentifier: string,
  umip?: UmipDataFromContentfulT
): RequestMetaData {
  // if we are dealing with a UMIP, get the title, description and UMIP url from Contentful
  const isUmip = decodedIdentifier.includes("Admin");
  if (isUmip) {
    return {
      title: umip?.title ?? decodedIdentifier,
      description: umip?.description ?? "No description was found for this UMIP.",
      umipUrl: umip?.umipLink,
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
    return {
      title: identifierDetails?.title ?? decodedIdentifier,
      description: identifierDetails?.summary ?? "No description was found for this request.",
      umipUrl: identifierDetails?.umipLink.url,
    };
  }

  // if the previous checks fail, we assume we are dealing with a Polymarket request
  // note that `umipUrl` is undefined in this case, as there is no UMIP to link to for this type of request

  let decodedAncillaryData = "";

  try {
    decodedAncillaryData = decodeHexString(ancillaryData);
  } catch (e) {
    console.error(e);
  }

  const ancillaryDataTitle = getTitleFromAncillaryData(decodedAncillaryData);
  const ancillaryDataDescription = getDescriptionFromAncillaryData(decodedAncillaryData);

  return {
    title: ancillaryDataTitle ?? decodedIdentifier,
    description: ancillaryDataDescription ?? "No description was found for this request.",
    umipUrl: undefined,
  };
}

export function getTitleFromAncillaryData(
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

  return decodedAncillaryData.substring(start + titleIdentifier.length, end);
}

export function getDescriptionFromAncillaryData(decodedAncillaryData: string, descriptionIdentifier = "description:") {
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
