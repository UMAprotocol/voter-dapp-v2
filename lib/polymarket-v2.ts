// Provenance comes from the oracle/bridge suffix, never from text inside JSON.
export const polymarketV2Reporter =
  "0x53703dd6129d723066b6362510e5ae2fecd48218";
export const polymarketV2ManagedOracle =
  "0x2c0367a9db231ddebd88a94b4f6461a6e47c58b1";

export function parsePolymarketV2AncillaryData(ancillaryData: string) {
  const end = ancillaryData.lastIndexOf("}") + 1;
  if (!end) return undefined;
  const stamp = ancillaryData
    .slice(end)
    .match(
      /^,ooRequester:([a-f0-9]{40}),childRequester:([a-f0-9]{40}),childChainId:137$/i
    );
  if (
    !stamp ||
    `0x${stamp[1].toLowerCase()}` !== polymarketV2Reporter ||
    `0x${stamp[2].toLowerCase()}` !== polymarketV2ManagedOracle
  )
    return undefined;

  let payload: unknown;
  try {
    payload = JSON.parse(ancillaryData.slice(0, end));
  } catch {
    return undefined;
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return undefined;
  const fields = payload as Record<string, unknown>;
  if (
    typeof fields.title !== "string" ||
    !fields.title.trim() ||
    typeof fields.description !== "string" ||
    !fields.description.trim()
  )
    return undefined;

  const outcomes =
    fields.type === 1 ? parseType1Outcomes(fields.res_data) : undefined;
  const resData = outcomes
    ? formatType1Mapping(outcomes)
    : typeof fields.res_data === "string"
    ? fields.res_data
    : "";
  const productSpec =
    typeof fields.product_spec === "string" ? fields.product_spec : "";
  // Type 1 rules carry the Polymarket market id as integration_id.
  const marketId = [fields.market_id, fields.integration_id].find(
    (id): id is string => typeof id === "string" && /^\d+$/.test(id)
  );
  return {
    title: fields.title,
    description: [fields.description, resData, productSpec]
      .filter((part) => part.trim())
      .join("\n\n"),
    resData,
    outcomes,
    marketId,
    rawRules: ancillaryData.slice(0, end),
  };
}

export type PolymarketV2OutcomeT = {
  value: string;
  label: string;
  code: string;
};

// Type 1 values are fixed; codes follow the p1/p2/p3 Polymarket convention.
const type1Codes: Record<string, string> = {
  "0": "p1",
  "1": "p2",
  "0.5": "p3",
};

/** Parses Type 1 `res_data`: [value, label] tuples whose order has no meaning.
 * 0 and 1 are required, 0.5 is optional. Anything else returns undefined so the
 * vote falls back to numeric input instead of guessing labels.
 */
function parseType1Outcomes(
  resData: unknown
): PolymarketV2OutcomeT[] | undefined {
  if (!Array.isArray(resData)) return undefined;
  const outcomes: PolymarketV2OutcomeT[] = [];
  for (const entry of resData) {
    if (!Array.isArray(entry) || entry.length !== 2) return undefined;
    const [value, label] = entry;
    const code =
      typeof value === "number" ? type1Codes[String(value)] : undefined;
    if (
      !code ||
      outcomes.some((outcome) => outcome.code === code) ||
      typeof label !== "string" ||
      !label.trim()
    )
      return undefined;
    outcomes.push({ value: String(value), label: label.trim(), code });
  }
  if (!["p1", "p2"].every((code) => outcomes.some((o) => o.code === code)))
    return undefined;
  return outcomes.sort((a, b) => a.code.localeCompare(b.code));
}

function formatType1Mapping(outcomes: PolymarketV2OutcomeT[]) {
  const values = outcomes.map(({ code, value }) => `${code}: ${value}`);
  const labels = outcomes.map(
    ({ code, label }) => `${code} corresponds to ${label}`
  );
  return `${values.join(", ")}. Where ${labels.join(", ")}.`;
}
