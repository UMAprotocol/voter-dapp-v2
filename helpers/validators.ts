import { isHexString } from "ethers/lib/utils";
import { define } from "superstruct";

export function hexString() {
  return define<`0x${string}`>("hex string", (value) => {
    return isHexString(value);
  });
}

export function positiveIntStr() {
  return define<string>("positive integer", (value) => {
    return Number.isInteger(Number(value)) && Number(value) >= 0;
  });
}
