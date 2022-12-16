import { ethers } from "ethers";
import { SigningKeys, SigningKey } from "types";
import { derivePrivateKey, recoverPublicKey } from "helpers";
import { config } from "helpers/config";

type Signer = ethers.Signer;
const { signingMessage } = config;

export async function sign(signer: Signer): Promise<SigningKeys> {
  const address = await signer.getAddress();
  const savedSigningKeys = getSavedSigningKeys();
  const signingKey = savedSigningKeys[address];
  if (signingKey) {
    return savedSigningKeys;
  }
  const newSigningKey = await makeSigningKey(signer, signingMessage);
  const newSigningKeys = {
    ...savedSigningKeys,
    [address]: newSigningKey,
  };
  saveSigningKeys(newSigningKeys);
  return newSigningKeys;
}
export async function makeSigningKey(
  signer: ethers.Signer,
  message: string
): Promise<SigningKey> {
  const signedMessage = await signer.signMessage(message);
  const privateKey = derivePrivateKey(signedMessage);
  const publicKey = recoverPublicKey(privateKey);
  return {
    privateKey,
    publicKey,
    signedMessage,
  };
}

export function saveSigningKeys(newSigningKeys: SigningKeys): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("signingKeys", JSON.stringify(newSigningKeys));
}

export function getSavedSigningKeys(): SigningKeys {
  if (typeof window === "undefined") return {};
  const savedSigningKeys = window.localStorage.getItem("signingKeys");
  return savedSigningKeys ? (JSON.parse(savedSigningKeys) as SigningKeys) : {};
}
