import {
  AdminTransactionByDecodedIdentifierT,
  AdminTransactionT,
  DecodedAdminTransactionT,
} from "types";

export async function getDecodedAdminTransactions(
  decodedIdentifiers: string[]
) {
  const response = await fetch("/api/decode-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifiers: decodedIdentifiers }),
  });

  if (!response.ok) {
    throw new Error("Error fetching decoded admin transactions");
  }

  const result = (await response.json()) as DecodedAdminTransactionT[];

  const merged: AdminTransactionT[] = [];

  // the resulting data is in the same order as the input
  // so we add the identifiers back in to let us associate them
  // with the correct vote
  result.forEach((decodedAdminTransaction, index) => {
    const decodedIdentifier = decodedIdentifiers[index];

    merged.push({
      ...decodedAdminTransaction,
      decodedIdentifier,
    });
  });

  // for efficient lookup, we transform the array into an object
  // with the identifier as the key
  return merged.reduce((acc, adminTransaction) => {
    const { decodedIdentifier: _removed, ...withoutIdentifier } =
      adminTransaction;
    acc[adminTransaction.decodedIdentifier] = withoutIdentifier;
    return acc;
  }, {} as AdminTransactionByDecodedIdentifierT);
}
