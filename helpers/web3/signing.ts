import { ethers } from "ethers";
import { derivePrivateKey, recoverPublicKey } from "helpers";
import { config } from "helpers/config";
import { SigningKey, SigningKeys } from "types";
import Web3 from "web3";

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
  console.log(message);
  const mm = window.ethereum;
  const isMM = Boolean(mm);
  const web3 = new Web3(mm);
  const address = await signer.getAddress();
  const signedMessage = isMM
    ? await web3.eth.sign(ethers.utils.keccak256(Buffer.from(message)), address)
    : await signer.signMessage(message);
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
