import { utils } from "ethers";
import { isEarlyVote } from "constant/voting/earlyRequestMagicNumber";
import type { DropdownItemT } from "types";

export function formatPolymarketProposedOutcome(
  proposedPrice: string | undefined,
  options: DropdownItemT[] | undefined
): string | undefined {
  if (proposedPrice === undefined || !/^-?\d+$/.test(proposedPrice))
    return undefined;
  if (isEarlyVote(proposedPrice)) return "Early request";

  // Both Polymarket identifiers (YES_OR_NO_QUERY and NUMERICAL) use 18 decimals.
  const value = utils.formatUnits(proposedPrice, 18).replace(/\.0$/, "");
  const label = options?.find(
    (option) => String(option.value) === value
  )?.label;
  return label && label !== value ? `${label} (${value})` : value;
}
