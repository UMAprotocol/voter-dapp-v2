export function parseQuestionAncillaryData(ancillaryData: string) {
  const question = ancillaryData.match(
    /^\s*q:\s*([\s\S]*?)(?=,\s*(?:resolution-source|rules):)/
  );
  const rules = ancillaryData.match(
    /,\s*rules:\s*([\s\S]*?)(?=,\s*(?:market|initializer|ooRequester|childRequester|childChainId):|$)/
  );
  // Preserve nested q: title:/description: requests whose description mentions rules.
  if (!question || !rules || /^title:/.test(question[1])) return undefined;

  const source = ancillaryData.match(
    /,\s*resolution-source:\s*([\s\S]*?)(?=,\s*rules:)/
  );
  return {
    title: question[1].trim(),
    description:
      rules[1].trim() +
      (source ? `\n\nResolution source: ${source[1].trim()}` : ""),
  };
}
