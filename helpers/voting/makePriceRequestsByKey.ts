import { BigNumber } from "ethers";
import { decodeHexString, makeUniqueKeyForVote } from "helpers";
import {
  PriceRequestByKeyT,
  PriceRequestT,
  RawPriceRequestDataT,
  VoteParticipationT,
  VoteResultsT,
} from "types";

export function makePriceRequestsByKey(
  priceRequests: RawPriceRequestDataT[] | undefined
) {
  const priceRequestsByKey: PriceRequestByKeyT = {};

  if (priceRequests?.length) {
    const formattedPriceRequests = formatPriceRequests(priceRequests);
    formattedPriceRequests?.forEach((priceRequest) => {
      priceRequestsByKey[priceRequest.uniqueKey] = priceRequest;
    });
  }

  return priceRequestsByKey;
}

function formatPriceRequests(priceRequests: RawPriceRequestDataT[]) {
  return priceRequests
    .map(formatPriceRequest)
    .filter((priceRequest): priceRequest is PriceRequestT => !!priceRequest);
}

function formatPriceRequest(
  priceRequest: RawPriceRequestDataT
): PriceRequestT & VoteParticipationT & VoteResultsT {
  const time =
    priceRequest.time instanceof BigNumber
      ? priceRequest.time.toNumber()
      : priceRequest.time;
  const timeMilliseconds = time * 1000;
  const timeAsDate = new Date(timeMilliseconds);
  const identifier = priceRequest.identifier;
  const ancillaryData = priceRequest.ancillaryData;
  const ancillaryDataL2 = priceRequest.ancillaryDataL2;
  let decodedIdentifier = "";
  let decodedAncillaryData = "";
  const revealedVoteByAddress = priceRequest.revealedVoteByAddress || {};
  try {
    decodedIdentifier = decodeHexString(identifier);
  } catch (e) {
    decodedIdentifier = "WARNING - INVALID IDENTIFIER";
  }
  try {
    decodedAncillaryData = decodeHexString(ancillaryDataL2);
  } catch (e) {
    decodedAncillaryData = `The ancillary data for this request is malformed and could not be decoded. Raw ancillary data: ${ancillaryDataL2}`;
  }
  const correctVote = priceRequest.correctVote;
  const participation = {
    uniqueCommitAddresses:
      priceRequest?.participation?.uniqueCommitAddresses || 0,
    uniqueRevealAddresses:
      priceRequest?.participation?.uniqueRevealAddresses || 0,
    totalTokensVotedWith:
      priceRequest?.participation?.totalTokensVotedWith || 0,
    totalTokensCommitted:
      priceRequest?.participation?.totalTokensCommitted || 0,
    minAgreementRequirement:
      priceRequest?.participation?.minAgreementRequirement || 0,
    minParticipationRequirement:
      priceRequest?.participation?.minParticipationRequirement || 0,
  };
  const results = priceRequest.results;
  const uniqueKey = makeUniqueKeyForVote(
    decodedIdentifier,
    time,
    ancillaryData
  );
  const isV1 = priceRequest.isV1 ? true : false;
  const isGovernance = priceRequest.isGovernance
    ? true
    : priceRequest.isGovernance;
  const rollCount = priceRequest.rollCount || 0;
  const resolvedPriceRequestIndex = priceRequest.resolvedPriceRequestIndex;

  return {
    time,
    identifier,
    ancillaryData,
    timeMilliseconds,
    timeAsDate,
    decodedIdentifier,
    decodedAncillaryData,
    resolvedPriceRequestIndex,
    correctVote,
    participation,
    results,
    uniqueKey,
    isV1,
    isGovernance,
    rollCount,
    revealedVoteByAddress,
    ancillaryDataL2,
  };
}
