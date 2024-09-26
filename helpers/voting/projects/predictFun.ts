// Predict.Fun Adapters

import { getChildChainId, getRequester } from "./polymarket";

const predictFunBinaryOutcomeAdapter =
  "0x0C1331E4a4bBD59B7aae2902290506bf8fbE3e6c";
const predictFunNegRiskAdapter = "0xB0c308abeC5d321A7B6a8E3ce43A368276178F7A";

export const predictFunRequesters = [
  predictFunBinaryOutcomeAdapter.toLowerCase(),
  predictFunNegRiskAdapter.toLowerCase(),
];

export function isPredictFunRequester(address: string): boolean {
  return predictFunRequesters.includes(address.toLowerCase());
}

const blastChainId = 81457;

export function checkIfIsPredictFun(
  decodedIdentifier: string,
  decodedAncillaryData: string
) {
  const queryTitleToken = "q: title:";
  const resultDataToken = "res_data:";
  const requester = getRequester(decodedAncillaryData);
  const childChainId = getChildChainId(decodedAncillaryData);
  const isPredictFun =
    decodedIdentifier === "YES_OR_NO_QUERY" &&
    decodedAncillaryData.includes(queryTitleToken) &&
    decodedAncillaryData.includes(resultDataToken) &&
    requester &&
    isPredictFunRequester(requester) &&
    childChainId === blastChainId;

  return isPredictFun;
}
