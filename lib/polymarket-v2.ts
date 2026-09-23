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

  const resData = typeof fields.res_data === "string" ? fields.res_data : "";
  const productSpec =
    typeof fields.product_spec === "string" ? fields.product_spec : "";
  return {
    title: fields.title,
    description: [fields.description, resData, productSpec]
      .filter((part) => part.trim())
      .join("\n\n"),
    resData,
    marketId:
      typeof fields.market_id === "string" && /^\d+$/.test(fields.market_id)
        ? fields.market_id
        : undefined,
    rawRules: ancillaryData.slice(0, end),
  };
}
