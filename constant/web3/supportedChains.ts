export const supportedChains = {
  1: "Ethereum",
  5: "Görli",
  10: "Optimism",
  137: "Polygon",
  288: "Boba",
  416: "SX",
  1514: "Story",
  80002: "Amoy",
  42161: "Arbitrum",
  11155111: "Sepolia",
  8453: "Base",
  81457: "Blast",
};

export function getOracleTypeDisplayName(oracleType: string | undefined) {
  if (!oracleType) return "Optimistic Oracle v1";
  switch (oracleType) {
    case "OptimisticOracle":
      return "Optimistic Oracle v1";
    case "OptimisticOracleV2":
      return "Optimistic Oracle v2";
    case "SkinnyOptimisticOracle":
      return "Skinny Optimistic Oracle";
    case "ManagedOptimisticOracleV2":
      return "Managed Optimistic Oracle v2";
    default:
      return oracleType;
  }
}
