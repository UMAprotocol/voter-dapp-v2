export async function getDecodedAdminTransactions() {
  const response = await fetch("/api/decode-admin", {
    method: "POST",
    body: JSON.stringify({ identifiers: ["Admin 1"] }),
  });

  if (!response.ok) {
    throw new Error("Error fetching decoded admin transactions");
  }

  return response.json();
}
