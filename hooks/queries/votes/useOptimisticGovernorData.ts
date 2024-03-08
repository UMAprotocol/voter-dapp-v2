import { useQuery } from "@tanstack/react-query";
import { MainnetOrL1Testnet } from "types";

import { useSetChain } from "@web3-onboard/react";
import request, { gql } from "graphql-request";
import { useWalletContext } from "hooks/contexts/useWalletContext";
import { useHandleError } from "hooks/helpers/useHandleError";
import { useIpfs } from "./useIpfs";

interface OptimisticGovernorProposalData {
  proposal: {
    explanationText: string;
    rules: string;
  };
}

interface SnapshotData {
  address: string;
  sig: string;
  hash: string;
  data: {
    domain: {
      name: string;
      version: string;
    };
    types: {
      Proposal: ProposalType[];
    };
    message: {
      space: string;
      type: string;
      title: string;
      body: string;
      discussion: string;
      choices: string[];
      start: number;
      end: number;
      snapshot: number;
      plugins: string;
      app: string;
      from: string;
      timestamp: number;
    };
  };
}

interface ProposalType {
  name: string;
  type: string;
}

export async function getProposalData(
  assertionId: string,
  chainId: MainnetOrL1Testnet
) {
  // TODO handle different chains
  let endpoint: string;
  switch (chainId) {
    case 1:
      endpoint =
        "https://api.thegraph.com/subgraphs/name/umaprotocol/mainnet-optimistic-governor";
      break;
    case 5:
      endpoint =
        "https://api.thegraph.com/subgraphs/name/umaprotocol/goerli-optimistic-governor";
      break;
    case 11155111:
      endpoint =
        "https://api.thegraph.com/subgraphs/name/reinis-frp/sepolia-optimistic-governor";
      break;
    default:
      endpoint =
        "https://api.thegraph.com/subgraphs/name/umaprotocol/mainnet-optimistic-governor";
      break;
  }
  const proposalQuery = gql`
    {
      proposal(
        id: "${assertionId}"
      ) {
        explanationText
        rules
      }
    }
  `;

  return request<OptimisticGovernorProposalData>(endpoint, proposalQuery);
}

export function useOptimisticGovernorData(decodedAncillaryData: string) {
  const [{ connectedChain }] = useSetChain();
  const { isWrongChain } = useWalletContext();
  const { onError } = useHandleError({ isDataFetching: true });

  const [_, assertionId, ooAsserter] =
    decodedAncillaryData.match(
      /assertionId:([a-f0-9]+),ooAsserter:([a-f0-9]+)/
    ) || [];

  const shouldFetch = !isWrongChain && assertionId != null;

  const queryResult = useQuery({
    queryKey: [assertionId, ooAsserter, connectedChain?.id],
    queryFn: () =>
      getProposalData(
        `0x${assertionId}`,
        Number(connectedChain?.id ?? 1) as MainnetOrL1Testnet
      ),
    enabled: shouldFetch,
    onError,
  });
  const isOptimisticGovernorVote = !!queryResult?.data?.proposal;

  const ipfsData = useIpfs<SnapshotData>(
    queryResult?.data?.proposal?.explanationText
  );

  return {
    ...(queryResult?.data?.proposal ?? {}),
    isOptimisticGovernorVote,
    ipfs: ipfsData.data,
  };
}
