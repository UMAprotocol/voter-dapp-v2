import { ethers } from "ethers";

export function decodeHexString(hexString: string) {
  try {
    const utf8String = ethers.utils.toUtf8String(hexString);
    // eslint-disable-next-line no-control-regex
    const paddingRemoved = utf8String.replace(/\u0000/g, "");
    return paddingRemoved;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Invalid hex string: ${e.message}`);
    } else {
      throw new Error(`Invalid hex string: ${e}`);
    }
  }
}