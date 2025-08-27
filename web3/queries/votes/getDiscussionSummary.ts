import { buildSearchParams } from "helpers/util/buildSearchParams";
import { SummaryResponse } from "types";
import { L1Request } from "types";

export async function getDiscussionSummary(
  l1Request: L1Request
): Promise<SummaryResponse | null> {
  const params = buildSearchParams({
    time: l1Request.time,
    identifier: l1Request.identifier,
    title: l1Request.title,
  });

  const response = await fetch(`/api/fetch-summary?${params}`);

  // Handle 404 as a valid "no summary" state, not an error
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error(response);
    throw new Error("Getting thread summary failed with unknown error");
  }
  return (await response.json()) as SummaryResponse;
}

export async function triggerSummaryGeneration(
  l1Request: L1Request
): Promise<void> {
  const params = buildSearchParams({
    time: l1Request.time,
    identifier: l1Request.identifier,
    title: l1Request.title,
  });

  try {
    const response = await fetch(`/api/update-summary?${params}`, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Failed to trigger summary generation:", response);
    }
  } catch (error) {
    console.error("Error triggering summary generation:", error);
  }
}
