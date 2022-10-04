import { NextApiRequest, NextApiResponse } from "next";

import { Contract, utils } from "ethers";
import { getNodeUrls, constructContractOnChain } from "./_common";

interface Request {
  identifier: string;
  timestamp: number;
  ancillaryData: string;
}

enum OptimisticOracleType {
  OptimisticOracle,
  OptimisticOracleV2,
  SkinnyOptimisticOracle,
}

interface AugmentedRequest extends Request {
  transactionHash: string;
  oracleType: OptimisticOracleType;
}

function getOoChainIds() {
  return Object.keys(getNodeUrls).map((z) => Number(z));
}

function constructOoUiLink(txHash: string, chainId: number, oracleType: string) {
  return `https://oracle.umaproject.org/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${oracleType}`;
}

async function constructOptimisticOraclesByChain(chainId: number): Promise<(Contract | null)[]> {
  const optimisticOracle = await constructContractOnChain(chainId, "OptimisticOracle");
  const optimisticOracleV2 = await constructContractOnChain(chainId, "OptimisticOracleV2");
  const skinnyOptimisticOracle =
    chainId == 1 ? await constructContractOnChain(chainId, "SkinnyOptimisticOracle") : null;
  return [optimisticOracle, optimisticOracleV2, skinnyOptimisticOracle];
}

async function getOptimisticOraclePriceRequestEventsByChainId(chainId: number): Promise<any[]> {
  const chainOptimisticOracles = await constructOptimisticOraclesByChain(chainId);
  console.log("LEN", chainOptimisticOracles[2]);
  const requests = await Promise.all(
    chainOptimisticOracles.map((optimisticOracle) =>
      optimisticOracle ? optimisticOracle.queryFilter(optimisticOracle.filters.RequestPrice()) : null
    )
  );

  return requests
    .map((oracleRequests, index) => {
      return oracleRequests
        ? oracleRequests.map((ooRequest) => {
            return {
              transactionHash: ooRequest.transactionHash,
              identifier: ooRequest?.args?.identifier,
              timestamp: Number(ooRequest?.args?.timestamp),
              ancillaryData: ooRequest?.args?.ancillaryData,
              oracleType: OptimisticOracleType[index],
            };
          })
        : [];
    })
    .flat();
}

// { requestTransactionHash: string; chainId: number; oracleType: any }[]
async function getRequestTxFromL1RequestInformation(l1Requests: Request[]): Promise<any> {
  const ooChainIds = getOoChainIds();
  const chainOoRequests = (
    await Promise.all(ooChainIds.map((chainId) => getOptimisticOraclePriceRequestEventsByChainId(chainId)))
  ).flat();

  const ooRequestTxs: { requestTransactionHash: string; chainId: number }[] = [];
  l1Requests.forEach((l1Request) => {
    let foundOoTx = { requestTransactionHash: "", chainId: 0, oracleType: "" };
    chainOoRequests.forEach((ooRequest, index) => {
      if (
        l1Request.identifier == ooRequest.identifier &&
        l1Request.timestamp == ooRequest.timestamp &&
        l1Request.ancillaryData == ooRequest.ancillaryData
      ) {
        foundOoTx = {
          requestTransactionHash: ooRequest.transactionHash,
          chainId: ooChainIds[index],
          oracleType: ooRequest.oracleType,
        };
        return;
      }
    });
    ooRequestTxs.push(foundOoTx);
  });
  return ooRequestTxs;
}

async function getAugmentingRequestInformation(l1Requests: Request[]) {
  const votingV1 = await constructContractOnChain(1, "Voting");
  //todo: add voting v2 when released.
  // const votingV2 = await constructContractOnChain(1, "VotingV2");
  const l1RequestEvents = (
    await Promise.all([
      votingV1.queryFilter(votingV1.filters.PriceRequestAdded()),
      // votingV2.queryFilter(votingV2.filters.PriceRequestAdded())
    ])
  ).flat();

  console.log("l1RequestEvents", JSON.stringify(l1RequestEvents));
  const l1RequestTxHashes = l1Requests.map((l1Request) => {
    console.log("l1Request", l1Request);
    return (
      l1RequestEvents.find(
        (event) =>
          l1Request.identifier == event?.args?.identifier &&
          l1Request.timestamp == event?.args?.timestamp &&
          l1Request.ancillaryData == event?.args?.ancillaryData
      )?.transactionHash ?? "rolled"
    );
  });

  const processedL1Requests = l1Requests.map((request) => {
    return {
      ...request,
      ancillaryData: stripAncillaryDataOfSupplementaryInformation(request?.ancillaryData),
    };
  });

  console.log("processedL1Requests", processedL1Requests);

  const requestTransactions = await getRequestTxFromL1RequestInformation(processedL1Requests);

  return l1RequestTxHashes.map((l1RequestTxHash, index) => {
    return {
      l1RequestTxHash,
      ooRequestUrl: constructOoUiLink(
        requestTransactions[index].txHash,
        requestTransactions[index].chainId,
        requestTransactions[index].oracleType
      ),
    };
  });
}

function stripAncillaryDataofSuplementaryInformation(ancillary: string) {
  let parsedAncillary = utils.toUtf8String(ancillary);
  // console.log(parsedAncillary);

  if (
    parsedAncillary.includes("ooRequester") &&
    parsedAncillary.includes("childRequester") &&
    parsedAncillary.includes("childChainId")
  )
    parsedAncillary = parsedAncillary.substring(0, parsedAncillary.indexOf("ooRequester") - 1);

  return utils.hexlify(utils.toUtf8Bytes(parsedAncillary));
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body;
    ["l1Requests"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey)) throw "Missing key in req body! required: l1Requests";
    });
    const readableTxData = await getAugmentingRequestInformation(body.l1Requests);
    response.status(200).send(readableTxData);
  } catch (e) {
    console.error(e);
    response
      .status(500)
      .send({ message: "Error in fetching augmented information", error: e instanceof Error ? e.message : e });
  }
}
