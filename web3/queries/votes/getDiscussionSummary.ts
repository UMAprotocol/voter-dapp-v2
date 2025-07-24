import { buildSearchParams } from "helpers/util/buildSearchParams";
import { SummaryResponse } from "pages/api/fetch-summary";
import { L1Request } from "types";

export async function getDiscussionSummary(
  l1Request: L1Request
): Promise<SummaryResponse> {
  const params = buildSearchParams({
    time: l1Request.time,
    identifier: l1Request.identifier,
    title: l1Request.title,
  });

  const response = await fetch(`/api/fetch-summary?${params}`);

  if (!response.ok) {
    console.error(response);
    throw new Error("Getting thread summary failed with unknown error");
  }
  return (await response.json()) as SummaryResponse;
}
