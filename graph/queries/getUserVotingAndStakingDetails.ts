// @ts-nocheck
import { BigNumber } from "ethers";
import { gql } from "graphql-request";
import { fetchWithFallback } from "helpers/graph/fetchWithFallback";
import { bigNumberFromFloatString } from "helpers";
import { config } from "helpers/config";
import {
  UserDataQuery,
  UserDataT,
  VoteHistoryByKeyT,
  VoteHistoryT,
} from "types";
const { graphEndpoint } = config;

type RawVote = {
  id: string;
  request: { id: string };
  voted: boolean;
  correctness: boolean;
  slashAmount: string;
  staking: boolean;
};

type FullUserNode = {
  annualPercentageReturn: string;
  annualReturn: string;
  cumulativeCalculatedSlash: string;
  cumulativeCalculatedSlashPercentage: string;
  countReveals: string;
  countNoVotes: string;
  countWrongVotes: string;
  countCorrectVotes: string;
  votesSlashed: RawVote[];
};

const USER_WITH_VOTES_QUERY = gql`
  query UserWithVotes($address: Bytes!, $first: Int!, $skip: Int!) {
    users(where: { address: $address }) {
      annualPercentageReturn
      annualReturn
      cumulativeCalculatedSlash
      cumulativeCalculatedSlashPercentage
      countReveals
      countNoVotes
      countWrongVotes
      countCorrectVotes
      votesSlashed(
        first: $first
        skip: $skip
        orderBy: id
        orderDirection: asc
      ) {
        id
        request {
          id
        }
        voted
        correctness
        slashAmount
        staking
      }
    }
  }
`;

export async function getUserVotingAndStakingDetails(
  address: string | undefined
): Promise<UserDataT> {
  if (!config.ponderEndpoint && !graphEndpoint) {
    throw new Error("No data endpoint configured");
  }

  if (!address) {
    return {
      apr: BigNumber.from(0),
      countReveals: BigNumber.from(0),
      countNoVotes: BigNumber.from(0),
      countWrongVotes: BigNumber.from(0),
      countCorrectVotes: BigNumber.from(0),
      cumulativeCalculatedSlash: BigNumber.from(0),
      cumulativeCalculatedSlashPercentage: BigNumber.from(0),
      voteHistoryByKey: {},
    };
  }

  const allVotes: RawVote[] = [];
  let skip = 0;
  const pageSize = 1000;
  let scalarFieldsGrabbed = false;
  let cachedScalars: Omit<FullUserNode, "votesSlashed"> | null = null;

  while (true) {
    const variables = { address, first: pageSize, skip };

    const result = await fetchWithFallback<{ users: FullUserNode[] }>(
      USER_WITH_VOTES_QUERY,
      variables
    );

    if (!result.users.length) {
      return {
        apr: BigNumber.from(0),
        countReveals: BigNumber.from(0),
        countNoVotes: BigNumber.from(0),
        countWrongVotes: BigNumber.from(0),
        countCorrectVotes: BigNumber.from(0),
        cumulativeCalculatedSlash: BigNumber.from(0),
        cumulativeCalculatedSlashPercentage: BigNumber.from(0),
        voteHistoryByKey: {},
      };
    }

    const userNode = result.users[0];

    if (!scalarFieldsGrabbed) {
      cachedScalars = {
        annualPercentageReturn: userNode.annualPercentageReturn,
        annualReturn: userNode.annualReturn,
        cumulativeCalculatedSlash: userNode.cumulativeCalculatedSlash,
        cumulativeCalculatedSlashPercentage:
          userNode.cumulativeCalculatedSlashPercentage,
        countReveals: userNode.countReveals,
        countNoVotes: userNode.countNoVotes,
        countWrongVotes: userNode.countWrongVotes,
        countCorrectVotes: userNode.countCorrectVotes,
      };
      scalarFieldsGrabbed = true;
    }

    const chunk = userNode.votesSlashed;
    if (chunk.length) {
      allVotes.push(...chunk);
    }

    if (chunk.length < pageSize) {
      break;
    }
    skip += pageSize;
  }

  const fullUserNode: FullUserNode = {
    ...(cachedScalars as Omit<FullUserNode, "votesSlashed">),
    votesSlashed: allVotes,
  };

  return parseUserVotingAndStakingDetails(fullUserNode);
}

function parseUserVotingAndStakingDetails(
  rawUserData: UserDataQuery["users"][0] | undefined
) {
  const apr = bigNumberFromFloatString(rawUserData?.annualPercentageReturn);
  const countReveals = bigNumberFromFloatString(rawUserData?.countReveals);
  const countNoVotes = bigNumberFromFloatString(rawUserData?.countNoVotes);
  const countWrongVotes = bigNumberFromFloatString(
    rawUserData?.countWrongVotes
  );
  const countCorrectVotes = bigNumberFromFloatString(
    rawUserData?.countCorrectVotes
  );
  const cumulativeCalculatedSlash = bigNumberFromFloatString(
    rawUserData?.cumulativeCalculatedSlash
  );
  const cumulativeCalculatedSlashPercentage = bigNumberFromFloatString(
    rawUserData?.cumulativeCalculatedSlashPercentage
  );
  const voteHistory =
    rawUserData?.votesSlashed.map((vote) => {
      const uniqueKey = vote.request.id;
      const voted = vote.voted;
      const correctness = vote.correctness;
      const slashAmount = bigNumberFromFloatString(vote.slashAmount);
      const staking = vote.staking;
      return { uniqueKey, voted, correctness, slashAmount, staking };
    }) ?? [];
  const voteHistoryByKey = makeVoteHistoryByKey(voteHistory);

  return {
    apr,
    countReveals,
    countNoVotes,
    countWrongVotes,
    countCorrectVotes,
    cumulativeCalculatedSlash,
    cumulativeCalculatedSlashPercentage,
    voteHistoryByKey,
  };
}

function makeVoteHistoryByKey(voteHistory: VoteHistoryT[] | undefined) {
  if (!voteHistory) return {};

  const voteHistoryByKey: VoteHistoryByKeyT = {};
  voteHistory.forEach((vote) => {
    voteHistoryByKey[vote.uniqueKey] = vote;
  });

  return voteHistoryByKey;
}
