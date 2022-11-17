import { DecodedAdminTransactionT } from "types";

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

  return response.json() as Promise<DecodedAdminTransactionT[]>;
}
