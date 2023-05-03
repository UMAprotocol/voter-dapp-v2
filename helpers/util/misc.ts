export const isExternalLink = (href: string) => !href.startsWith("/");
import { chainConstantsList, config } from "helpers/config";

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

function getBlockExplorerUrlForChain(chainId: number) {
  switch (chainId) {
    case 0:
      return;
    case 1:
      return "https://etherscan.io";
    case 5:
      return "https://goerli.etherscan.io";
    case 10:
      return "https://optimistic.etherscan.io";
    case 100:
      return "https://gnosisscan.io";
    case 137:
      return "https://polygonscan.com";
    case 288:
      return "https://bobascan.com";
    case 416:
      return "https://explorer.sx.technology";
    case 43114:
      return "https://snowtrace.io";
    case 42161:
      return "https://arbiscan.io";
    case 80001:
      return "https://mumbai.polygonscan.com";
  }
}

export function makeBlockExplorerLink(
  hash: string,
  chainId: number,
  type: "tx" | "address" | "block"
) {
  const url = getBlockExplorerUrlForChain(chainId);

  if (!url) return "";

  return `${url}/${type}/${hash}`;
}
