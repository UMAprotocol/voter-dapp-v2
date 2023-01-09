export const supportedChains = {
  1: "Ethereum",
  5: "Görli",
  10: "Optimism",
  100: "Gnosis",
  137: "Polygon",
  288: "Boba",
  416: "SX",
  43114: "Avalanche",
  42161: "Arbitrum",
};

export function getOracleProperName(oracleType:string):string{
  switch (oracleType) {
    case "OptimisticOracle":
      return "Optimistic Oracle";
    case "OptimisticOracleV2":
      return "Optimistic Oracle V2";
    case "SkinnyOptimisticOracle":
      return "Skinny Optimistic Oracle";
    default:
      return oracleType;
  }
}
