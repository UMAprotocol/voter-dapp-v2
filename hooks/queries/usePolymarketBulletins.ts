import { useQuery } from "@tanstack/react-query";
import { getPolymarketBulletins } from "web3/queries/getPolymarketBulletins";

export function usePolymarketBulletins(ancillaryData?: string) {
  try {
    return useQuery({
      queryKey: ["polymarketBulletins", ancillaryData],
      queryFn: () => getPolymarketBulletins(ancillaryData!),
      enabled: !!ancillaryData,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Failed to fetch polymarket bulletins: ${e.message}`);
    } else {
      throw e;
    }
  }
}
