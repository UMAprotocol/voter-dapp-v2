/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAbi, getContractNames } from "@uma/contracts-node";
import { NextApiRequest, NextApiResponse } from "next";
// @ts-expect-error - no types for this module
import abiDecoder from "abi-decoder";
import { constructContract, getProviderByChainId } from "./_common";
import { config } from "helpers/config";

type AbiDecoder = typeof abiDecoder;

const { chainId } = config;

const blocksPerYear = 2253571;
const blocksPerMonth = Math.floor(blocksPerYear / 12);
export class TransactionDataDecoder {
  private static instance: TransactionDataDecoder;
  public readonly abiDecoder: AbiDecoder;
  private constructor() {
    this.abiDecoder = abiDecoder;
    getContractNames().forEach((name: any) =>
      this.abiDecoder.addABI(getAbi(name))
    );
  }

  public static getInstance(): TransactionDataDecoder {
    if (!TransactionDataDecoder.instance)
      TransactionDataDecoder.instance = new TransactionDataDecoder();

    return TransactionDataDecoder.instance;
  }

  public decodeTransaction(txData: string): { name: string; params: any } {
    return this.abiDecoder.decodeMethod(txData) as any;
  }
}

interface Transaction {
  data?: string;
  to: string;
  value: string;
}

export function decodeTransaction(transaction: Transaction): string {
  let returnValue = "";

  // Give to and value.
  returnValue += "To: " + transaction.to;
  returnValue += "\nValue (in Wei): " + transaction.value;

  // No data -> simple ETH send.
  if (
    !transaction.data ||
    transaction.data.length === 0 ||
    transaction.data === "0x"
  )
    returnValue += "\nTransaction is a simple ETH send (no data).";
  else {
    // Loading the abi decoder is expensive, so do it only if called and cache it for repeated use.
    const decoder = TransactionDataDecoder.getInstance();

    // Txn data isn't empty -- attempt to decode.
    const decodedTxn = decoder.decodeTransaction(transaction.data);
    if (!decodedTxn) {
      // Cannot decode txn, just give the user the raw data.
      returnValue +=
        "\nCannot decode transaction (does not match any UMA Protocol Signature).";
      returnValue += "\nRaw transaction data: " + transaction.data;
    } else {
      // Decode was successful -- pretty print the results.
      returnValue += "\nTransaction details:\n";
      returnValue += JSON.stringify(decodedTxn, null, 4);
    }
  }
  return returnValue;
}

function _decodeData(data: any) {
  return TransactionDataDecoder.getInstance().decodeTransaction(data);
}

function transactionsWithS(value: number) {
  return `containing ${value} transaction${value === 1 ? "" : "s"}`;
}

function getNameFromChainId(value: string) {
  switch (value) {
    case "1":
      return "Mainnet";
    case "10":
      return "Optimism";
    case "100":
      return "xDai";
    case "137":
      return "Polygon";
    case "288":
      return "Boba";
    case "42161":
      return "Arbitrum";
    case "81457":
      return "Blast";
    case "11155111":
      return "Sepolia";
    default:
      return "Unknown";
  }
}

const _generateTransactionDataRecursive = function (
  txnObj: any,
  readableTxData = ""
) {
  if (!txnObj) return readableTxData;
  // If transaction is a proposal then recursively print out its transactions
  if (txnObj.name === "propose" && txnObj.params.transactions.length > 0) {
    readableTxData +=
      `Transaction is a proposal ` +
      `${transactionsWithS(txnObj.params.transactions.length)}\n`;
    txnObj.params.transactions.forEach((_txn: any) => {
      const decodedTxnData = _decodeData(_txn.data);

      // If decodedTxnData itself has a `data` key, then decode it:
      if (decodedTxnData.params.data) {
        const decodedParamData = _decodeData(decodedTxnData.params.data);
        decodedTxnData.params.data = decodedParamData;
      }
      readableTxData = _generateTransactionDataRecursive(
        { ...decodedTxnData, to: _txn.to, value: _txn.value },
        readableTxData
      );
    });
    // cross-chain governance
  } else if (
    txnObj.name === "relayGovernance" &&
    txnObj?.params?.calls?.length > 0
  ) {
    readableTxData +=
      `Transaction is a ${getNameFromChainId(txnObj?.params?.chainId)} ` +
      `cross-chain ${transactionsWithS(txnObj?.params?.calls?.length)} \n`;

    txnObj.params.calls.forEach((_txn: any) => {
      const decodedTxnData = _decodeData(_txn.data);

      // If decodedTxnData itself has a `data` key, then decode it:
      if (decodedTxnData.params.data) {
        const decodedParamData = _decodeData(decodedTxnData.params.data);
        decodedTxnData.params.data = decodedParamData;
      }
      readableTxData += `${JSON.stringify(txnObj, null, 4)}`;

      readableTxData = _generateTransactionDataRecursive(
        { ...decodedTxnData, to: _txn.to, value: _txn.value },
        readableTxData
      );
    });
    // Multicall
  } else if (txnObj.name === "aggregate" && txnObj?.params?.calls?.length > 0) {
    readableTxData +=
      `Transaction is multicall ` +
      `${transactionsWithS(txnObj.params.calls.length)}\n`;
    txnObj.params.calls.forEach((_call: any) => {
      const decodedTxnData = _decodeData(_call.callData);

      readableTxData = _generateTransactionDataRecursive(
        { ...decodedTxnData, to: _call.target, value: "0" },
        readableTxData
      );
    });
  } else {
    // Pretty print:
    readableTxData += `\n${JSON.stringify(txnObj, null, 4)}`;
  }
  return readableTxData;
};

async function generateReadableAdminTransactionData(identifiers: string[]) {
  const provider = getProviderByChainId(chainId);
  const currentBlock = await provider.getBlockNumber();
  const governorV1 = await constructContract(chainId, "Governor");

  const governorV2 = await constructContract(chainId, "GovernorV2");

  const events = (
    await Promise.all([
      governorV1.queryFilter(
        governorV1.filters.NewProposal(),
        currentBlock - blocksPerMonth
      ),
      governorV2.queryFilter(
        governorV2.filters.NewProposal(),
        currentBlock - blocksPerMonth
      ),
    ])
  ).flat();

  const transactionSets = identifiers
    .map(
      (identifier) =>
        events.find(
          (event) =>
            event?.args?.id.toString() ===
            identifier.substring(identifier.indexOf(" ") + 1)
        )?.args?.transactions || null
    )
    .filter(Boolean);

  return transactionSets.map((transactions, index) => {
    return {
      identifier: identifiers[index],
      transactions: transactions.map((adminTransaction: any) => {
        return {
          data: adminTransaction.data,
          to: adminTransaction.to,
          toName: adminTransaction.data.contractName,
          value: adminTransaction.value.toString(),
          decodedData: _generateTransactionDataRecursive(
            _decodeData(adminTransaction.data)
          ),
        };
      }),
    };
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body;
    ["identifiers"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: identifiers";
    });
    const readableTxData = await generateReadableAdminTransactionData(
      body.identifiers
    );
    response.status(200).send(readableTxData);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in decoding admin call",
      error: e instanceof Error ? e.message : e,
    });
  }
}
