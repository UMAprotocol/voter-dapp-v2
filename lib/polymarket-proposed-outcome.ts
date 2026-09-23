import { utils } from "ethers";
import { isEarlyVote } from "constant/voting/earlyRequestMagicNumber";
import type { DropdownItemT } from "types";

export function formatPolymarketProposedOutcome(
  proposedPrice: string | undefined,
  options: DropdownItemT[] | undefined
): string | undefined {
  if (proposedPrice === undefined || !/^-?\d+$/.test(proposedPrice))
    return undefined;

  // Both Polymarket identifiers (YES_OR_NO_QUERY and NUMERICAL) use 18 decimals.
  const value = utils.formatUnits(proposedPrice, 18).replace(/\.0$/, "");
  const option = options?.find((option) => String(option.value) === value);
  if (!option) return isEarlyVote(proposedPrice) ? "Early request" : value;

  const label =
    value === "0.5" && /^(unknown(?:\/50[-/]50)?|50[-/]50)$/i.test(option.label)
      ? "50/50"
      : option.label;
  return option.secondaryLabel && /^p\d+$/i.test(option.secondaryLabel)
    ? `${option.secondaryLabel.toUpperCase()} (${label})`
    : label;
}
