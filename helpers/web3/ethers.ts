import { ethers } from "ethers";
import { capitalizeFirstLetter } from "helpers";

export const formatEther = ethers.utils.formatEther;

export const parseEther = ethers.utils.parseEther;

// This catches any potential errors form parsing an unknown string value, returns 0 if error happens.
export function parseEtherSafe(value: string, decimals = 18): ethers.BigNumber {
  try {
    // previously we were casting this to number, and using tofixed. this does not work because casting to
    // number may change the value. this was affecting the "max" button when decimals of user was very long.
    return ethers.utils.parseUnits(value, decimals);
  } catch (err) {
    return ethers.BigNumber.from(0);
  }
}

export const solidityKeccak256 = ethers.utils.solidityKeccak256;

export const randomBytes = ethers.utils.randomBytes;

export const toUtf8String = ethers.utils.toUtf8String;

export const formatBytes32String = ethers.utils.formatBytes32String;

export const commify = ethers.utils.commify;

export const formatTransactionError = (error: unknown): string => {
  const errors: unknown[] = [error];
  const visited = new Set<unknown>();
  let description: string | undefined;

  // Wallets can wrap RPC errors in another error or return plain objects.
  for (const candidate of errors) {
    if (visited.has(candidate)) continue;
    visited.add(candidate);
    let message: string | undefined;
    let code: unknown;
    if (typeof candidate === "string") {
      message = candidate;
    } else if (typeof candidate === "object" && candidate !== null) {
      const details = candidate as Record<string, unknown>;
      code = details.code;
      message =
        typeof details.reason === "string"
          ? details.reason
          : typeof details.message === "string"
          ? details.message
          : undefined;
      errors.push(
        details.error,
        details.data,
        details.originalError,
        details.cause
      );
    }
    if (
      code === "INSUFFICIENT_FUNDS" ||
      // Match provider fee-balance messages, not contract reverts or gas limits.
      (message &&
        /^insufficient funds for (?:gas\b|intrinsic transaction cost\b)/i.test(
          message.trim()
        ))
    ) {
      return "Insufficient ETH to pay for gas. Add ETH to your wallet and try again.";
    }
    if (!description && message?.trim()) description = message;
  }

  if (!description) return "Transaction failed. Please try again.";
  // ethers transactions put all call data and debug data between parens, so we will filter it out
  const message = description.split("(")[0] || description;
  return capitalizeFirstLetter(message.trim());
};

export const zeroAddress = ethers.constants.AddressZero;

export const getAddress = ethers.utils.getAddress;

export const isAddress = ethers.utils.isAddress;

export const oneEth = ethers.BigNumber.from("1000000000000000000");

export const maximumApprovalAmount = ethers.constants.MaxUint256;
