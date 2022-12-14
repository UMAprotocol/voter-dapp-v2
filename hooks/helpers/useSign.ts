import { useMutation } from "@tanstack/react-query";
import { SigningKeys } from "types";
import { sign } from "helpers";
import { ethers } from "ethers";

export function useSign(
  signer: ethers.Signer | null | undefined,
  setSigningKeys: (signingKeys: SigningKeys) => void
) {
  return useMutation(async () => (signer ? sign(signer) : {}), {
    onError: (error) => console.error("Error signing:", error),
    onSuccess: setSigningKeys,
  });
}
