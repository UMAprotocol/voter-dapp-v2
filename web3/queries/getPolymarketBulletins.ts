import { createPolymarketBulletinContract } from "../contracts/createPolymarketBulletin";
import { ethers, utils } from "ethers";
import assert from "assert";

export function decodeHexString(hexString: string) {
  try {
    const utf8String = ethers.utils.toUtf8String(hexString);
    // eslint-disable-next-line no-control-regex
    return utf8String.replace(/\u0000/g, "");
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Invalid hex string: ${e.message}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid hex string: ${e}`);
    }
  }
}
function getDescriptionFromAncillaryData(
  decodedAncillaryData: string,
  descriptionIdentifier = "description:"
): string | undefined {
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
export function getPolymarketBulletinContractFromAncillaryData(
  queryText: string
): string | undefined {
  const match = queryText.match(
    /Updates made by the question creator via the bulletin board at (0x[a-fA-F0-9]{40})/
  );
  return match && utils.isAddress(match[1]) ? match[1] : undefined;
}

function cleanAncillaryData(ancillaryHex: string): string {
  const decodedString = decodeHexString(ancillaryHex);
  const initializerIndex = decodedString.indexOf("initializer:");

  if (initializerIndex === -1) return ancillaryHex;

  const endIndex =
    decodedString.indexOf(",", initializerIndex) !== -1
      ? decodedString.indexOf(",", initializerIndex)
      : decodedString.length;

  return ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes(decodedString.substring(0, endIndex))
  );
}

export type Bulletin = {
  timestamp: number;
  update: string;
};

export async function getPolymarketBulletins(
  ancillaryHex: string
): Promise<Bulletin[]> {
  const ancillaryData = decodeHexString(ancillaryHex);
  const description = getDescriptionFromAncillaryData(ancillaryData);

  assert(description, "Description not found in ancillary data.");

  const bulletinAddress =
    getPolymarketBulletinContractFromAncillaryData(ancillaryData);

  assert(bulletinAddress, "Bulletin address not found in ancillary data.");

  const contract = createPolymarketBulletinContract(bulletinAddress);

  const matchOwnerAddress = description.match(/initializer:([a-fA-F0-9]{40})/);
  const ownerAddress = matchOwnerAddress
    ? "0x" + matchOwnerAddress[1]
    : undefined;

  assert(ownerAddress, "Bulletin owner address not found.");
  // ancillary data has stuff appended to it, which needs to be removed before calculating question id.
  const cleanHex = cleanAncillaryData(ancillaryHex);
  const questionId = utils.keccak256(cleanHex);
  const updates = await contract.getUpdates(questionId, ownerAddress);
  return updates.map((update) => ({
    timestamp: update.timestamp.toNumber(),
    update: utils.toUtf8String(update.update),
  }));
}
