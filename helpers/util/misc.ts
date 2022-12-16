export const isExternalLink = (href: string) => !href.startsWith("/");
import { config } from "helpers/config";

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function makeTransactionHashLink(
  label: string,
  transactionHash: string | undefined
) {
  if (!transactionHash) return;
  return {
    label,
    href: config.makeTransactionHashLink(transactionHash),
  };
}
