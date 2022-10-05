import { NextApiRequest, NextApiResponse } from "next";

import { Contract } from "ethers";
import { getNodeUrls, constructContractOnChain } from "./_common";

interface Request {
  identifier: string;
  time: number;
}

enum OptimisticOracleType {
  OptimisticOracle,
  OptimisticOracleV2,
  SkinnyOptimisticOracle,
}

function getOoChainIds() {
  return Object.keys(getNodeUrls()).map((z) => Number(z));
}

function constructOoUiLink(txHash: string, chainId: number, oracleType: string) {
  return `https://oracle.umaproject.org/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${oracleType}`;
}

async function constructOptimisticOraclesByChain(chainId: number): Promise<(Contract | null)[]> {
  const optimisticOracle = await constructContractOnChain(chainId, "OptimisticOracle");
  const optimisticOracleV2 = await constructContractOnChain(chainId, "OptimisticOracleV2");

  // Only mainnet has a SkinnyOptimisticOracle so only construct it here. All other chains of interest have OOv1 and V2.
  const skinnyOptimisticOracle =
    chainId == 1 ? await constructContractOnChain(chainId, "SkinnyOptimisticOracle") : null;
  return [optimisticOracle, optimisticOracleV2, skinnyOptimisticOracle];
}

async function getOptimisticOraclePriceRequestEventsByChainId(chainId: number): Promise<any[]> {
  const chainOptimisticOracles = await constructOptimisticOraclesByChain(chainId);

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
              time: Number(ooRequest?.args?.timestamp),
              oracleType: OptimisticOracleType[index],
            };
          })
        : [];
    })
    .flat();
}

async function getRequestTxFromL1RequestInformation(
  l1Requests: Request[]
): Promise<{ requestTransactionHash: string; chainId: number; oracleType: any }[]> {
  const ooChainIds = getOoChainIds();

  const chainOoRequests = await Promise.all(
    ooChainIds.map((chainId) => getOptimisticOraclePriceRequestEventsByChainId(chainId))
  );
  const ooRequestTxs: { requestTransactionHash: string; chainId: number; oracleType: any }[] = [];
  l1Requests.forEach((l1Request) => {
    let foundOoTx = { requestTransactionHash: "", chainId: 0, oracleType: "" };
    chainOoRequests.forEach((_, ooChainId) => {
      chainOoRequests[ooChainId].forEach((ooRequest, index) => {
        if (
          l1Request.identifier.toLowerCase() == ooRequest.identifier.toLowerCase() &&
          l1Request.time == ooRequest.time
        ) {
          foundOoTx = {
            requestTransactionHash: ooRequest.transactionHash,
            chainId: ooChainIds[ooChainId],
            oracleType: ooRequest.oracleType,
          };
          return;
        }
      });
    });
    ooRequestTxs.push(foundOoTx);
  });
  return ooRequestTxs;
}

async function getAugmentingRequestInformation(l1Requests: Request[]) {
  const votingV1 = await constructContractOnChain(1, "Voting");
  // todo: add voting v2 when released.
  // const votingV2 = await constructContractOnChain(1, "VotingV2");
  const l1RequestEvents = (
    await Promise.all([
      votingV1.queryFilter(votingV1.filters.PriceRequestAdded()),
      // votingV2.queryFilter(votingV2.filters.PriceRequestAdded())
    ])
  ).flat();

  const l1RequestTxHashes = l1Requests.map((l1Request) => {
    return (
      l1RequestEvents.find((event) => {
        if (
          l1Request.identifier.toLowerCase() == event?.args?.identifier.toLowerCase() &&
          l1Request.time == event?.args?.time
        ) {
          return true;
        } else return false;
      })?.transactionHash ?? "rolled"
    );
  });

  const requestTransactions = await getRequestTxFromL1RequestInformation(l1Requests);

  return l1RequestTxHashes.map((l1RequestTxHash, index) => {
    return {
      l1RequestTxHash,
      ooRequestUrl: constructOoUiLink(
        requestTransactions[index].requestTransactionHash,
        requestTransactions[index].chainId,
        requestTransactions[index].oracleType
      ),
    };
  });
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
