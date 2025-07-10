// @ts-nocheck
import request from "graphql-request";
import { config } from "helpers/config";

export async function fetchWithFallback<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoints = [config.ponderEndpoint, config.graphEndpoint].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await request<T>(endpoint, query, variables);
    } catch (err) {
      console.error(`GraphQL request failed for ${endpoint}`, err);
      lastError = err;
      // try next
    }
  }
  throw lastError ?? new Error("No data endpoints configured");
}