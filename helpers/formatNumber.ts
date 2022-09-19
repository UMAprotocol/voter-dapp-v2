import { BigNumber, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function formatNumberForDisplay(number: BigNumber | undefined) {
  if (!number) return "0";
  return ethers.utils.commify(formatEther(number));
}
