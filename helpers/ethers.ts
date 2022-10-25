import { ethers } from "ethers";

export const formatEther = ethers.utils.formatEther;

export const parseEther = ethers.utils.parseEther;

// This catches any potential errors form parsing an unknown string value, returns 0 if error happens.
export function parseEtherSafe(value: string, decimals = 18): ethers.BigNumber {
  try {
    return ethers.utils.parseUnits(Number(value).toFixed(decimals), decimals);
  } catch (err) {
    return ethers.BigNumber.from(0);
  }
}

export const solidityKeccak256 = ethers.utils.solidityKeccak256;

export const randomBytes = ethers.utils.randomBytes;

export const toUtf8String = ethers.utils.toUtf8String;

export const formatBytes32String = ethers.utils.formatBytes32String;

export const commify = ethers.utils.commify;
