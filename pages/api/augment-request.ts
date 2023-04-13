import assert from "assert";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import * as ss from "superstruct";
import { SupportedChainIds } from "types";
import {
  constructContract,
  ContractName,
  getFromBlock,
  getNodeUrls,
  isSupportedChainId,
} from "./_common";

const debug = !!process.env.DEBUG;

type OracleType = Extract<
  ContractName,
  | "OptimisticOracle"
  | "OptimisticOracleV2"
  | "OptimisticOracleV3"
  | "SkinnyOptimisticOracle"
>;
type VotingType = Extract<ContractName, "Voting" | "VotingV2">;

const EnabledVoting: VotingType[] = ["Voting", "VotingV2"];
const EnabledOracles: OracleType[] = [
  "OptimisticOracle",
  "OptimisticOracleV2",
  "OptimisticOracleV3",
  "SkinnyOptimisticOracle",
];

const L1Request = ss.object({
  uniqueKey: ss.string(),
  time: ss.number(),
  identifier: ss.string(),
});
type L1Request = ss.Infer<typeof L1Request>;

const L1Requests = ss.array(L1Request);
type L1Requests = ss.Infer<typeof L1Requests>;

const RequestBody = ss.object({
  l1Requests: L1Requests,
  chainId: ss.defaulted(ss.number(), 1),
});
type RequestBody = ss.Infer<typeof RequestBody>;

const CommonEventData = ss.object({
  transactionHash: ss.string(),
  identifier: ss.string(),
  time: ss.number(),
  contractType: ss.string(),
  chainId: ss.number(),
  domainId: ss.string(),
  assertionId: ss.string(),
  claim: ss.string(),
  asserter: ss.string(),
  callbackRecipient: ss.string(),
  escalationManager: ss.string(),
  expirationTime: ss.number(),
  caller: ss.string(),
});
type CommonEventData = ss.Infer<typeof CommonEventData>;

function getOoChainIds() {
  return Object.keys(getNodeUrls()).map(Number) as SupportedChainIds[];
}

function constructOoUiLink(
  txHash: string | undefined,
  chainId: string | number | undefined,
  oracleType: string | undefined
) {
  if (!txHash || !chainId || !oracleType) return;
  if (!isSupportedChainId(chainId)) return;
  const subDomain = Number(chainId) === 5 ? "testnet." : "";
  return `https://${subDomain}oracle.uma.xyz/request?transactionHash=${txHash}&chainId=${chainId}&oracleType=${castOracleNameForOOUi(
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
    case "OptimisticOracleV3":
      return "OptimisticV3";
    default:
      throw new Error("Unable to cast oracle name for OO UI: " + oracleType);
  }
}

type LookupTable<E> = Record<string, Record<number, E>>;
function createLookupTable<Event extends { time: number; identifier: string }>(
  events: Event[],
  table: LookupTable<Event> = {}
): LookupTable<Event> {
  return events.reduce((table, event) => {
    const identifier = event.identifier.toLowerCase();
    const time = event.time;
    if (identifier && table[identifier] === undefined) table[identifier] = {};
    if (time && table[identifier][time] === undefined)
      table[identifier][time] = event;
    return table;
  }, table);
}

async function getVotingRequestAdded(
  contractType: VotingType,
  chainId: SupportedChainIds
): Promise<CommonEventData[]> {
  const contract = await constructContract(chainId, contractType);
  const events = await contract.queryFilter(
    contract.filters.RequestAdded
      ? contract.filters.RequestAdded()
      : contract.filters.PriceRequestAdded(),
    getFromBlock(contractType as string, chainId as number)
  );
  return events.map((event) =>
    ss.create(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        transactionHash: event?.transactionHash,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        identifier: event?.args?.identifier,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        time:
          event?.args?.time instanceof BigNumber
            ? event?.args?.time?.toNumber()
            : event?.args?.time,
        contractType,
        chainId,
        assertionId: "",
        domainId: "",
        claim: "",
        asserter: "",
        callbackRecipient: "",
        escalationManager: "",
        expirationTime: 0,
        caller: "",
      },
      CommonEventData
    )
  );
}

async function getManyVotingPriceRequestAdded(
  contractTypes: VotingType[],
  chainIds: SupportedChainIds[]
): Promise<CommonEventData[]> {
  const requests = contractTypes
    .map((contractType) =>
      chainIds.map((chainId) => getVotingRequestAdded(contractType, chainId))
    )
    .flat();
  return (await Promise.allSettled(requests))
    .map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      if (debug) console.warn(result.reason);
      return [];
    })
    .flat();
}

async function getOracleRequestPrices(
  contractType: OracleType,
  chainId: SupportedChainIds
): Promise<CommonEventData[]> {
  const contract = await constructContract(chainId, contractType);
  const events = await contract.queryFilter(
    contract.filters.RequestPrice(),
    getFromBlock(contractType, chainId)
  );
  return events.map((event) =>
    ss.create(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        transactionHash: event?.transactionHash,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        identifier: event?.args?.identifier,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        time:
          event?.args?.timestamp instanceof BigNumber
            ? event?.args?.timestamp?.toNumber()
            : event?.args?.timestamp,
        contractType,
        chainId,
        assertionId: "",
        domainId: "",
        claim: "",
        asserter: "",
        callbackRecipient: "",
        escalationManager: "",
        expirationTime: 0,
        caller: "",
      },
      CommonEventData
    )
  );
}

async function getOracleChildTunnelMessages(): Promise<CommonEventData[]> {
  const contract = await constructContract(137, "OracleChildTunnel");
  const events = await contract.queryFilter(
    contract.filters.PriceRequestAdded()
  );
  return events.map((event) =>
    ss.create(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        transactionHash: event?.transactionHash,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        identifier: event?.args?.identifier,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        time:
          event?.args?.time instanceof BigNumber
            ? event?.args?.time?.toNumber()
            : event?.args?.time,
        contractType: "OptimisticOracleV2", // The event based type is only ever OOv2.
        chainId: 137,
        assertionId: "",
        domainId: "",
        claim: "",
        asserter: "",
        callbackRecipient: "",
        escalationManager: "",
        expirationTime: 0,
        caller: "",
      },
      CommonEventData
    )
  );
}

async function getOov3Assertions(
  chainId: SupportedChainIds
): Promise<CommonEventData[]> {
  //
  const contract = await constructContract(chainId, "OptimisticOracleV3");
  const events = await contract.queryFilter(contract.filters.AssertionMade());
  //

  const assertionDetails = await Promise.all(
    events.map((event) => contract.assertions(event?.args?.assertionId))
  );
  //
  return events.map((event, index) =>
    ss.create(
      {
        transactionHash: event?.transactionHash,
        identifier: event?.args?.identifier,
        contractType: "OptimisticOracleV3", // The event based type is only ever OOv2.
        time:
          assertionDetails[index].assertionTime instanceof BigNumber
            ? assertionDetails[index].assertionTime?.toNumber()
            : assertionDetails[index].assertionTime,
        chainId,
        assertionId: event?.args?.assertionId,
        domainId: event?.args?.domainId || "",
        claim: event?.args?.claim,
        asserter: event?.args?.asserter,
        callbackRecipient: event?.args?.callbackRecipient,
        escalationManager: event?.args?.escalationManager,
        expirationTime:
          event?.args?.expirationTime instanceof BigNumber
            ? event?.args?.expirationTime?.toNumber()
            : event?.args?.expirationTime,
        caller: event?.args?.caller,
      },
      CommonEventData
    )
  );
}

async function getManyOracleRequestsPrices(
  oracleTypes: OracleType[],
  chainIds: SupportedChainIds[]
): Promise<CommonEventData[]> {
  const requests = oracleTypes
    .map((oracleType) =>
      chainIds.map((chainId) => getOracleRequestPrices(oracleType, chainId))
    )
    .flat();

  // To accommodate event based expiration on polygon, we need to also query the oracle child tunnel to join
  // timestamps correctly. This should be refined in the future.
  const oracleChildTunnel = getOracleChildTunnelMessages();
  const assertions = chainIds
    .map((chainId) => getOov3Assertions(chainId))
    .flat();

  const processedOutputs = (
    await Promise.allSettled([requests, oracleChildTunnel, assertions].flat())
  )
    .map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      if (debug) console.warn(result.reason);
      return [];
    })
    .flat();
  //
  return processedOutputs;
}

async function augmentRequests({ l1Requests, chainId }: RequestBody) {
  assert(isSupportedChainId(chainId), `Unsupported chainid: ${chainId}`);
  const votingPriceRequestAddedEvents = await getManyVotingPriceRequestAdded(
    EnabledVoting,
    [chainId]
  );
  const votingPriceRequestTable = createLookupTable(
    votingPriceRequestAddedEvents
  );

  const ooChains = getOoChainIds();
  const requestPriceEvents = await getManyOracleRequestsPrices(
    EnabledOracles,
    ooChains
  );
  //
  const requestPriceTable = createLookupTable(requestPriceEvents);
  //

  return l1Requests.map((l1Request) => {
    const votingRequestEvent =
      votingPriceRequestTable?.[l1Request.identifier.toLowerCase()]?.[
        l1Request.time
      ] || {};
    const oracleRequestPriceEvent =
      requestPriceTable?.[l1Request.identifier.toLowerCase()]?.[
        l1Request.time
      ] || {};

    return {
      ...l1Request,
      l1RequestTxHash: votingRequestEvent.transactionHash,
      ooRequestUrl: constructOoUiLink(
        oracleRequestPriceEvent.transactionHash,
        oracleRequestPriceEvent.chainId,
        oracleRequestPriceEvent.contractType
      ),
      originatingChainTxHash: oracleRequestPriceEvent.transactionHash,
      originatingChainId: oracleRequestPriceEvent.chainId,
      originatingOracleType: oracleRequestPriceEvent.contractType,
      optimisticOracleV3Data:
        oracleRequestPriceEvent.contractType == "OptimisticOracleV3"
          ? {
              domainId: oracleRequestPriceEvent?.domainId || "",
              claim: oracleRequestPriceEvent?.claim || "",
              asserter: oracleRequestPriceEvent?.asserter || "",
              callbackRecipient:
                oracleRequestPriceEvent?.callbackRecipient || "",
              escalationManager:
                oracleRequestPriceEvent?.escalationManager || "",
              expirationTime: oracleRequestPriceEvent?.expirationTime || "",
              caller: oracleRequestPriceEvent?.caller || "",
            }
          : undefined,
    };
  });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  response.setHeader("Cache-Control", "max-age=0, s-maxage=2592000"); // Cache for 30 days and re-build cache if re-deployed.

  try {
    const body: RequestBody = ss.create(request.body, RequestBody);
    const result = await augmentRequests(body);
    response.status(200).send(result);
  } catch (e) {
    if (debug) console.error(e);
    response.status(500).send({
      message: "Error in fetching augmented information",
      error: e instanceof Error ? e.message : e,
    });
  }
}
