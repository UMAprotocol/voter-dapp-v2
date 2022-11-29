export const isExternalLink = (href: string) => !href.startsWith("/");

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function makeTransactionHashLink(
  label: string,
  transactionHash: string | undefined,
  isGoerli = true
) {
  if (!transactionHash) return;
  return {
    label,
    href: `https://${
      isGoerli ? "goerli." : ""
    }etherscan.io/tx/${transactionHash}`,
  };
}
