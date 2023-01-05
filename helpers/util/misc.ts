export const isExternalLink = (href: string) => !href.startsWith("/");
import { config, chainConstantsList } from "helpers/config";

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// this will make a link to etherescan ( or whatever block explorer for the chain )
// by omitting the chain id, it will make a link for your primary configured chain ( usually mainnet or goerli )
export function makeTransactionHashLink(
  label: string,
  transactionHash?: string,
  chainId?: string | number
) {
  if (!transactionHash) return;
  const chainInfo = chainConstantsList.find(
    (constant) => constant.chainId === Number(chainId ?? config.chainId)
  );
  if (chainInfo === undefined) return;
  return {
    label,
    href: chainInfo.makeTransactionHashLink(transactionHash),
  };
}
