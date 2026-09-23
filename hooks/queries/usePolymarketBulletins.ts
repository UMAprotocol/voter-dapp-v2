import { parsePolymarketV2AncillaryData } from "lib/polymarket-v2";
import { decodeHexString } from "helpers/web3/decodeHexString";
import { useQuery } from "@tanstack/react-query";
import { getPolymarketBulletins } from "web3/queries/getPolymarketBulletins";
import * as s from "superstruct";

const updateResponse = s.type({
  bulletins: s.array(s.type({ timestamp: s.number(), update: s.string() })),
});

export function usePolymarketBulletins(
  ancillaryData?: string,
  identifier?: string
) {
  const isV2 = Boolean(
    ancillaryData &&
      parsePolymarketV2AncillaryData(decodeHexString(ancillaryData))
  );
  return useQuery({
    queryKey: ["polymarketBulletins", ancillaryData, identifier, isV2],
    queryFn: async () => {
      if (!ancillaryData) return;
      if (!isV2) return getPolymarketBulletins(ancillaryData);
      const response = await fetch("/api/polymarket-v2-rule-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, ancillaryData }),
      });
      if (!response.ok)
        throw new Error("Polymarket V2 rule updates are unavailable");
      return s.create(await response.json(), updateResponse).bulletins;
    },
    enabled: !!ancillaryData && (!isV2 || !!identifier),
    refetchInterval: 30_000,
  });
}
