export function getEntriesForPage<EntryType>(
  pageNumber: number,
  resultsPerPage: number,
  entries: EntryType[]
) {
  const startIndex = (pageNumber - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  return entries.slice(startIndex, endIndex);
}
