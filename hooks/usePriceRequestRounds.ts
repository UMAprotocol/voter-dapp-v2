import getPriceRequestRounds from "graph/queries/getPriceRequestRounds";
import { useQuery } from "@tanstack/react-query";

export default function usePriceRequestRounds(orderBy: string, orderDirection: string, numToQuery: number) {
  return useQuery(["priceRequestRounds"], () => getPriceRequestRounds(orderBy, orderDirection, numToQuery));
}
