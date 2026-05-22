import {
  createPolymarketBulletinContract,
  type RawBulletin,
} from "../contracts/createPolymarketBulletin";
import { ethers, utils } from "ethers";
import assert from "assert";
import {
  decodeHexString,
  getDescriptionFromAncillaryData,
  getInitializer,
  getRequester,
  sanitizeAncillaryData,
} from "helpers";
import {
  type BulletinOwnerQuery,
  getBulletinOwnerQueries,
} from "helpers/voting/projects/polymarketBulletinOwners";

export function getPolymarketBulletinContractFromAncillaryData(
  queryText: string
): string | undefined {
  // const match = queryText.match(
  //   /Updates made by the question creator via the bulletin board at (0x[a-fA-F0-9]{40})/
  // );
  // return match && utils.isAddress(match[1]) ? match[1] : undefined;

  // use ooRequester address
  return getRequester(queryText);
}

function cleanAncillaryData(ancillaryHex: string): string {
  const decodedString = decodeHexString(ancillaryHex);

  return ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes(sanitizeAncillaryData(decodedString))
  );
}

export type Bulletin = {
  timestamp: number;
  update: string;
};

function formatBulletinUpdates(
  updates: RawBulletin[],
  ownerQuery: BulletinOwnerQuery
): Bulletin[] {
  return updates
    .map((update) => ({
      timestamp: update.timestamp.toNumber(),
      update: utils.toUtf8String(update.update),
    }))
    .filter(
      (bulletin) =>
        ownerQuery.maxTimestamp === undefined ||
        bulletin.timestamp <= ownerQuery.maxTimestamp
    );
}

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
  const ownerAddress = getInitializer(ancillaryData);

  assert(ownerAddress, "Bulletin owner address not found.");
  const ownerQueries = getBulletinOwnerQueries(ownerAddress);
  // ancillary data has stuff appended to it, which needs to be removed before calculating question id.
  const cleanHex = cleanAncillaryData(ancillaryHex);
  const questionId = utils.keccak256(cleanHex);
  const updates = await Promise.all(
    ownerQueries.map(async (ownerQuery) =>
      formatBulletinUpdates(
        await contract.getUpdates(questionId, ownerQuery.owner),
        ownerQuery
      )
    )
  );
  return updates.flat().sort((a, b) => a.timestamp - b.timestamp);
}
