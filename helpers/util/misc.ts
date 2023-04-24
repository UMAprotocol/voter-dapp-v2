export const isExternalLink = (href: string) => !href.startsWith("/");
import { mobileAndUnder, tabletAndUnder } from "constant";
import { chainConstantsList, config } from "helpers/config";
import { css } from "styled-components";

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

export const hideOnTabletAndUnder = css`
  @media ${tabletAndUnder} {
    display: none;
  }
`;

/**
 * Hides content on mobile and under
 */
export const hideOnMobileAndUnder = css`
  @media ${mobileAndUnder} {
    display: none;
  }
`;

/**
 * Hides content by default, and shows it on tablet and under.
 * Defaults to display: block, but can be overridden with the --display variable.
 */
export const showOnTabletAndUnder = css`
  display: none;

  @media ${tabletAndUnder} {
    display: var(--display, block);
  }
`;

/**
 * Hides content by default, and shows it on mobile and under.
 * Defaults to display: block, but can be overridden with the --display variable.
 */
export const showOnMobileAndUnder = css`
  display: none;

  @media ${mobileAndUnder} {
    display: var(--display, block);
  }
`;
