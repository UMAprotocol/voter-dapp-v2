export async function getIsOldDesignatedVotingAccount(account: string) {
  const response = await fetch("/api/designated-voting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ account }),
  });

  if (!response.ok) {
    throw new Error("Error fetching is old designated voting account");
  }

  const { message, designatedVotingContract } = (await response.json()) as {
    message: string;
    designatedVotingContract: string;
  };

  const isOldDesignatedVotingAccount =
    message !== "" && designatedVotingContract !== "";

  return {
    isOldDesignatedVotingAccount,
    message,
    designatedVotingContract,
  };
}
