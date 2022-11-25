import {
  OptimisticOracleEthers,
  OptimisticOracleV2Ethers,
  SkinnyOptimisticOracleEthers,
  VotingEthers,
} from "@uma/contracts-node";
import { NextApiRequest, NextApiResponse } from "next";
import { OracleTypeT, PriceRequestT, SupportedChainIds } from "types";
import { constructContract, getNodeUrls } from "./_common";

enum OracleType {
  OptimisticOracle,
  OptimisticOracleV2,
  SkinnyOptimisticOracle,
}

function getOoChainIds() {
  return Object.keys(getNodeUrls()).map(Number) as SupportedChainIds[];
}

function constructOoUiLink(
  txHash: string | undefined,
  chainId: SupportedChainIds | undefined,
  oracleType: OracleTypeT | undefined
) {
  if (!txHash || !chainId || !oracleType) return;
  return `https://oracle.umaproject.org/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${castOracleNameForOOUi(
    oracleType
  )}`;
}

function castOracleNameForOOUi(oracleType: string): string {
  switch (oracleType) {
    case "OptimisticOracle":
      return "Optimistic";
    case "OptimisticOracleV2":
      return "OptimisticV2";
    case "SkinnyOptimisticOracle":
      return "Skinny";
    default:
      return "";
  }
}

async function constructOptimisticOraclesByChain(chainId: SupportedChainIds) {
  const optimisticOracle = (await constructContract(
    chainId,
    "OptimisticOracle"
  )) as OptimisticOracleEthers;
  const optimisticOracleV2 = (await constructContract(
    chainId,
    "OptimisticOracleV2"
  )) as OptimisticOracleV2Ethers;

  // Only mainnet has a SkinnyOptimisticOracle so only construct it here. All other chains of interest have OOv1 and V2.
  const skinnyOptimisticOracle =
    chainId == 1
      ? ((await constructContract(
          chainId,
          "SkinnyOptimisticOracle"
        )) as SkinnyOptimisticOracleEthers)
      : null;
  return [optimisticOracle, optimisticOracleV2, skinnyOptimisticOracle];
}

async function getOptimisticOraclePriceRequestEventsByChainId(
  chainId: SupportedChainIds
) {
  const chainOptimisticOracles = await constructOptimisticOraclesByChain(
    chainId
  );

  const requests = await Promise.all(
    chainOptimisticOracles.map((optimisticOracle) =>
      optimisticOracle
        ? optimisticOracle.queryFilter(optimisticOracle.filters.RequestPrice())
        : null
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
              oracleType: OracleType[index] as OracleTypeT,
            };
          })
        : [];
    })
    .flat();
}

type OoTransactionT = {
  requestTransactionHash: string | undefined;
  chainId: SupportedChainIds | undefined;
  oracleType: OracleTypeT | undefined;
};

async function getRequestTxFromL1RequestInformation(
  l1Requests: PriceRequestT[]
) {
  const ooChainIds = getOoChainIds();

  const chainOoRequests = await Promise.all(
    ooChainIds.map((chainId) =>
      getOptimisticOraclePriceRequestEventsByChainId(chainId)
    )
  );
  const ooRequestTxs: (OoTransactionT | undefined)[] = [];
  l1Requests.forEach((l1Request) => {
    const foundOoRequestTx: OoTransactionT = {
      requestTransactionHash: undefined,
      chainId: undefined,
      oracleType: undefined,
    };
    chainOoRequests.forEach((_, ooChainId) => {
      chainOoRequests[ooChainId].forEach((ooRequest) => {
        if (
          l1Request.identifier.toLowerCase() ==
            ooRequest.identifier.toLowerCase() &&
          l1Request.time == ooRequest.time
        ) {
          foundOoRequestTx.requestTransactionHash = ooRequest.transactionHash;
          foundOoRequestTx.chainId = ooChainIds[ooChainId];
          foundOoRequestTx.oracleType = ooRequest.oracleType;
        }
      });
    });
    ooRequestTxs.push(foundOoRequestTx);
  });
  return ooRequestTxs;
}

async function getAugmentingRequestInformation(l1Requests: PriceRequestT[]) {
  const votingV1 = (await constructContract(1, "Voting")) as VotingEthers;
  // todo: add voting v2 when released.
  // const votingV2 = await constructContract(1, "VotingV2");
  const l1RequestEvents = (
    await Promise.all([
      votingV1.queryFilter(votingV1.filters.PriceRequestAdded()),
      // votingV2.queryFilter(votingV2.filters.PriceRequestAdded())
    ])
  ).flat();

  const l1RequestTxHashes = l1Requests.map((l1Request) => {
    const l1RequestTxHash =
      l1RequestEvents.find((event) => {
        if (
          l1Request.identifier.toLowerCase() ==
            event.args?.identifier?.toLowerCase() &&
          event.args.time.eq(l1Request.time)
        ) {
          return true;
        } else return false;
      })?.transactionHash ?? "rolled";
    return {
      uniqueKey: l1Request.uniqueKey,
      l1RequestTxHash,
    };
  });

  const requestTransactions = await getRequestTxFromL1RequestInformation(
    l1Requests
  );

  return l1RequestTxHashes.map(({ l1RequestTxHash, uniqueKey }, index) => {
    return {
      l1RequestTxHash,
      uniqueKey,
      ooRequestUrl: constructOoUiLink(
        requestTransactions[index]?.requestTransactionHash,
        requestTransactions[index]?.chainId,
        requestTransactions[index]?.oracleType
      ),
      originatingChainTxHash:
        requestTransactions[index]?.requestTransactionHash,
      originatingChainId: requestTransactions[index]?.chainId,
      originatingOracleType: requestTransactions[index]?.oracleType,
    };
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body = request.body as { l1Requests: PriceRequestT[] };
    ["l1Requests"].forEach((requiredKey) => {
      if (!Object.keys(body).includes(requiredKey))
        throw "Missing key in req body! required: l1Requests";
    });
    const readableTxData = await getAugmentingRequestInformation(
      body.l1Requests
    );
    response.status(200).send(readableTxData);
  } catch (e) {
    console.error(e);
    response.status(500).send({
      message: "Error in fetching augmented information",
      error: e instanceof Error ? e.message : e,
    });
  }
}
