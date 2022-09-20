import { BigNumber } from "ethers";
import { commify, formatEther } from "ethers/lib/utils";

export function formatNumberForDisplay(number: BigNumber | undefined) {
  if (!number) return "0";
  return commify(formatEther(number));
}
