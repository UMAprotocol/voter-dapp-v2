import EthCrypto from "eth-crypto";
import { BigNumber } from "ethers";
import { randomBytes, solidityKeccak256 } from "helpers";

// Encrypts a message using an ethereum public key. To decrypt messages that are encrypted with this method, use
// decryptMessage().
export async function encryptMessage(
  publicKey: string,
  message: string
): Promise<string> {
  const encryptedMessageObject = await EthCrypto.encryptWithPublicKey(
    publicKey,
    message
  );
  return "0x" + EthCrypto.cipher.stringify(encryptedMessageObject);
}

export async function decryptMessage(
  privKey: string,
  encryptedMessage: string
): Promise<string> {
  const encryptedMessageObject = EthCrypto.cipher.parse(
    encryptedMessage.slice(2)
  );
  return await EthCrypto.decryptWithPrivateKey(privKey, encryptedMessageObject);
}

// Blacklisted price identifiers that will not automatically display on voter clients.
export const IDENTIFIER_BLACKLIST = { SOME_IDENTIFIER: ["1596666977"] };

// Price identifiers that should resolve prices to non 18 decimal precision. Any identifiers
// not on this list are assumed to resolve to 18 decimals.
export const IDENTIFIER_NON_18_PRECISION = {
  USDBTC: 8,
  "STABLESPREAD/USDC": 6,
  "STABLESPREAD/BTC": 8,
  "ELASTIC_STABLESPREAD/USDC": 6,
  BCHNBTC: 8,
  AMPLUSD: 6,
  "COMPUSDC-APR-FEB28/USDC": 6,
  "COMPUSDC-APR-MAR28/USDC": 6,
  // The following identifiers are used in local test environments only:
  TEST8DECIMALS: 8,
  TEST8DECIMALSANCIL: 8,
  TEST6DECIMALS: 6,
  TEST6DECIMALSANCIL: 6,
  SHERLOCK_CLAIM: 6,
};

type IdentifierNon18Precision = keyof typeof IDENTIFIER_NON_18_PRECISION;

function isNon18Precision(
  identifier: string
): identifier is IdentifierNon18Precision {
  return identifier in IDENTIFIER_NON_18_PRECISION;
}

export const getPrecisionForIdentifier = (identifier: string): number => {
  return isNon18Precision(identifier)
    ? IDENTIFIER_NON_18_PRECISION[identifier]
    : 18;
};

export function getRandomSignedInt(): BigNumber {
  const unsignedValue = getRandomUnsignedInt();

  // The signed range is just the unsigned range decreased by 2^255.
  const signedOffset = BigNumber.from(2).pow(BigNumber.from(255));
  return unsignedValue.sub(signedOffset);
}

// Generate a random unsigned 256 bit int.
export function getRandomUnsignedInt(): BigNumber {
  return BigNumber.from(randomBytes(32));
}

export function derivePrivateKey(signature: string) {
  const pk = solidityKeccak256(["string"], [signature]);
  if (pk) return pk;
  return "";
}

export function recoverPublicKey(privateKey: string) {
  return EthCrypto.publicKeyByPrivateKey(privateKey);
}
