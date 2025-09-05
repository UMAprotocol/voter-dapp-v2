import * as ss from "superstruct";
import {
  AugmentedVoteDataResponseT,
  AugmentedVoteDataResponseSchema,
} from "types";

const ErrorT = ss.object({
  message: ss.string(),
  error: ss.string(),
});

export async function getAugmentedVoteData(params: {
  ancillaryData: string;
  time: number;
  identifier: string;
}): Promise<AugmentedVoteDataResponseT> {
  const response = await fetch("/api/augment-request-gql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const { message, error } = ss.create(await response.json(), ErrorT);
    throw new Error([message, error].join(": "));
  }

  return ss.create(await response.json(), AugmentedVoteDataResponseSchema);
}
