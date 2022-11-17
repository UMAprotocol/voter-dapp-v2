export async function getDecodedAdminTransactions() {
  const response = await fetch("/api/decode-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifiers: ["Admin 181"] }),
  });

  if (!response.ok) {
    throw new Error("Error fetching decoded admin transactions");
  }

  return response.json();
}
