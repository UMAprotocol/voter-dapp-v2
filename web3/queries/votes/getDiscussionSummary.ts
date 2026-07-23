import { buildSearchParams } from "helpers/util/buildSearchParams";
import { warnOnce } from "helpers/util/log";
import { SummaryResponse } from "types";
import { L1Request } from "types";

export async function getDiscussionSummary(
  l1Request: L1Request
): Promise<SummaryResponse | null | "disabled"> {
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

  // Handle 403 as disabled summary
  if (response.status === 403) {
    return "disabled";
  }

  if (!response.ok) {
    throw new Error(
      `Getting thread summary failed with status ${response.status}`
    );
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
      warnOnce(
        `update-summary:${l1Request.identifier}:${l1Request.time}`,
        `Failed to trigger summary generation (status ${response.status})`
      );
    }
  } catch (error) {
    warnOnce(
      `update-summary:${l1Request.identifier}:${l1Request.time}`,
      "Error triggering summary generation:",
      error
    );
  }
}
