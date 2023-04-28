export function checkIfIsOptimisticGovernor(decodedAncillaryData: string) {
  return (
    decodedAncillaryData.includes("rules:") &&
    decodedAncillaryData.includes("explanation:")
  );
}

const optimisticGovernorTitle = (explanation: string | undefined) =>
  `OSnap Request ${explanation ?? ""}`;

const optimisticGovernorDescription = (
  explanation: string | undefined,
  rules: string | undefined
) => `=
${
  explanation
    ? `*Explanation*  
${explanation}`
    : ""
}     
${
  rules
    ? `*Rules*  
${rules}`
    : ""
}`;

export function parseOptimisticGovernorAncillaryData(
  decodedAncillaryData: string
) {
  const explanation = decodedAncillaryData.match(
    /explanation:"(.*?)",rules:/
  )?.[1];
  const rules = decodedAncillaryData.match(/rules:"(.*?)"/)?.[1];

  return {
    title: optimisticGovernorTitle(explanation),
    description: optimisticGovernorDescription(explanation, rules),
  };
}
