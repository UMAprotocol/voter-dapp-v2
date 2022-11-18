/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";

// @ts-expect-error - no types for this module
import abiDecoder from "abi-decoder";
import { getContractNames, getAbi } from "@uma/contracts-node";
import { constructContractOnChain } from "./_common";

type AbiDecoder = typeof abiDecoder;

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

const _generateTransactionDataRecursive = function (
  txnObj: any,
  readableTxData = ""
) {
  // If transaction is a proposal then recursively print out its transactions
  if (txnObj.name === "propose" && txnObj.params.transactions.length > 0) {
    readableTxData += `Transaction is a proposal containing ${txnObj.params.transactions.length} transactions:\n`;
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
    readableTxData += `Transaction is a cross-chain governance action proposal containing ${txnObj?.params?.calls?.length} transactions:\n`;
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
    readableTxData += `Transaction is a multicall transaction containing ${txnObj.params.calls.length} transactions:\n`;
    txnObj.params.calls.forEach((_call: any) => {
      const decodedTxnData = _decodeData(_call.callData);
      readableTxData = _generateTransactionDataRecursive(
        { ...decodedTxnData, to: _call.target, value: "0" },
        readableTxData
      );
    });
  } else {
    // Pretty print:
    readableTxData += `\nNested transactions: \n${JSON.stringify(
      txnObj,
      null,
      4
    )}`;
  }
  return readableTxData;
};

async function generateReadableAdminTransactionData(identifiers: string[]) {
  const governorV1 = await constructContractOnChain(1, "Governor");

  // TODO: to enable decoding of v2 transactions we simply need to uncomment this.
  // const governorV2 = constructContractOnChain(1, "GovernorV2");

  const events = (
    await Promise.all([
      governorV1.queryFilter(governorV1.filters.NewProposal()),
      // governorV2.queryFilter(governorV2.filters.NewProposal()),
    ])
  ).flat();

  const transactions = identifiers
    .map(
      (identifier) =>
        events.find(
          (event) =>
            event?.args?.id.toString() ===
            identifier.substring(identifier.indexOf(" ") + 1)
        )?.args?.transactions || null
    )
    .flat();

  return transactions.map((transaction) => {
    return {
      data: transaction.data,
      to: transaction.to,
      value: transaction.value.toString(),
      decodedData: _generateTransactionDataRecursive(
        _decodeData(transaction.data)
      ),
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
