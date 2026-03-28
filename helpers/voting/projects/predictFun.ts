// Predict.Fun Adapters

import { getInitializer, getRequester } from "./polymarket";

const predictFunRequester = "0x2C0367a9DB231dDeBd88a94b4f6461a6e47C58B1";
const predictFunInitializer = "0x0168e3F4DE550942ce528FE9697d387A33465BA1";

export const predictFunRequesters = [predictFunRequester.toLowerCase()];

export function isPredictFunRequester(address: string): boolean {
  return predictFunRequesters.includes(address.toLowerCase());
}

export function isPredictFunInitializer(address: string): boolean {
  return predictFunInitializer.toLowerCase() === address.toLowerCase();
}

export function checkIfIsPredictFun(
  decodedIdentifier: string,
  decodedAncillaryData: string
) {
  const initializer = getInitializer(decodedAncillaryData);

  // If from project-controlled initializer EOA, match immediately (mirrors oracle dapp behavior)
  if (initializer && isPredictFunInitializer(initializer)) {
    return true;
  }

  const queryTitleToken = "q: title:";
  const resultDataToken = "res_data:";
  const requester = getRequester(decodedAncillaryData);

  return Boolean(
    decodedIdentifier === "YES_OR_NO_QUERY" &&
      decodedAncillaryData.includes(queryTitleToken) &&
      decodedAncillaryData.includes(resultDataToken) &&
      requester &&
      isPredictFunRequester(requester)
  );
}
