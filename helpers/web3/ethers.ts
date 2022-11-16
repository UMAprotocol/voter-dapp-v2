import { ethers } from "ethers";
import { capitalizeFirstLetter } from "helpers";

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

export const formatTransactionError = (error: Error) => {
  // ethers transactions put all call data and debug data between parens, so we will filter it out
  const message = error.message.split("(")[0] || error.message;
  return capitalizeFirstLetter(message);
};

export const zeroAddress = ethers.constants.AddressZero;

export const getAddress = ethers.utils.getAddress;

export const isAddress = ethers.utils.isAddress;

export const oneEth = ethers.BigNumber.from("1000000000000000000");

export const maximumApprovalAmount = ethers.constants.MaxUint256;
