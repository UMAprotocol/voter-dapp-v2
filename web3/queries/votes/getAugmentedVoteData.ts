import * as ss from "superstruct";
import {
  AugmentedVoteDataResponseT,
  AugmentedVoteDataByKeyT,
  PriceRequestByKeyT,
} from "types";
import { config } from "helpers/config";

const ErrorT = ss.object({
  message: ss.string(),
  error: ss.string(),
});

export async function getAugmentedVoteData(
  priceRequests: PriceRequestByKeyT,
  chainId: number = config.chainId
): Promise<AugmentedVoteDataByKeyT> {
  const response = await fetch("/api/augment-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      l1Requests: Object.values(priceRequests).map((req) => ({
        uniqueKey: req.uniqueKey,
        time: req.time,
        identifier: req.identifier,
      })),
      chainId,
    }),
  });

  if (!response.ok) {
    const { message, error } = ss.create(await response.json(), ErrorT);
    throw new Error([message, error].join(": "));
  }

  const result: AugmentedVoteDataResponseT[] = ss.create(
    await response.json(),
    ss.array(AugmentedVoteDataResponseT)
  );

  const init: Record<string, AugmentedVoteDataResponseT> = {};
  return result.reduce((byKey, augmentedData: AugmentedVoteDataResponseT) => {
    const key = augmentedData.uniqueKey;
    byKey[key] = {
      ...priceRequests[key],
      ...augmentedData,
    };
    return byKey;
    // this still needs to be casted because superstruct isnt validating the enumerated data such as
    // chain id and oracle type which are stricter in typescript. this should prevent compile issues even though
    // its not ideal
  }, init) as AugmentedVoteDataByKeyT;
}
