import { BigNumber, ethers } from "ethers";

export function formatNumberForDisplay(number: BigNumber | undefined) {
  if (!number) return "0";
  return ethers.utils.commify(formatEther(number));
}

export function formatEther(number: BigNumber) {
  return ethers.utils.formatEther(number);
}

export function parseEther(number: string) {
  return ethers.utils.parseEther(number);
}
