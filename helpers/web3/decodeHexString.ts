import { toUtf8String } from "helpers";
import { object, string, optional } from "superstruct";

export function decodeHexString(hexString: string) {
  try {
    const utf8String = toUtf8String(hexString);
    // eslint-disable-next-line no-control-regex
    const paddingRemoved = utf8String.replace(/\u0000/g, "");
    return paddingRemoved;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Invalid hex string: ${e.message}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid hex string: ${e}`);
    }
  }
}

export const StructuredClaim = object({
  title: optional(string()),
  description: optional(string()),
});
// check if claim is structured, return title, or shortened entire claim
export function getClaimTitle(claim: string): string {
  let title = claim;
  try {
    const parsedClaim = JSON.parse(claim);
    if (StructuredClaim.is(parsedClaim)) {
      if (parsedClaim.title) {
        title = parsedClaim.title;
      }
    }
  } catch (error) {
    // If JSON parsing fails, fall back to returning the entire claim
  }
  return title;
}

export function getClaimDescription(claim: string): string {
  let description = claim;
  try {
    const parsedClaim = JSON.parse(claim);
    if (StructuredClaim.is(parsedClaim)) {
      if (parsedClaim.description) {
        description = parsedClaim.description;
      }
    }
  } catch (error) {
    // If JSON parsing fails, fall back to returning the entire claim
  }
  return description;
}
