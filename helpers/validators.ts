import { isHexString } from "ethers/lib/utils";
import { define } from "superstruct";

export function hexString() {
  return define<`0x${string}`>("hexString", (value) => {
    return isHexString(value);
  });
}
