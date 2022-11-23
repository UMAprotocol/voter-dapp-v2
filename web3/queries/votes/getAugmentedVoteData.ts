import {
  AugmentedVoteDataByKeyT,
  AugmentedVoteDataT,
  PriceRequestByKeyT,
} from "types";

export async function getAugmentedVoteData(priceRequests: PriceRequestByKeyT) {
  const response = await fetch("/api/augment-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ l1Requests: Object.values(priceRequests) }),
  });

  if (!response.ok) {
    throw new Error("Error fetching augmented request data");
  }

  const result = (await response.json()) as AugmentedVoteDataT[];

  const byKey: AugmentedVoteDataByKeyT = {};

  result.forEach((augmentedData) => {
    byKey[augmentedData.uniqueKey] = augmentedData;
  });

  return byKey;
}
