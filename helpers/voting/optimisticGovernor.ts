export function checkIfIsOptimisticGovernor(decodedAncillaryData: string) {
  return (
    decodedAncillaryData.includes("assertionId:") &&
    decodedAncillaryData.includes("ooAsserter:")
  );
}

export const getOptimisticGovernorTitle = (explanation?: string) =>
  `OSnap Request ${explanation ?? ""}`;
