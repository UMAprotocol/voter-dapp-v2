import { BigNumber } from "ethers";
import request, { gql } from "graphql-request";
import { bigNumberFromFloatString } from "helpers";
import { config } from "helpers/config";
import {
  UserDataQuery,
  UserDataT,
  VoteHistoryByKeyT,
  VoteHistoryT,
} from "types";
import { DEFAULT_PAGE_SIZE, MAX_ALLOWED_SKIP } from "./constants";
const { graphEndpoint } = config;

const getUserDataQuery = (
  address: string,
  first: number,
  skip: number
): string => {
  return gql`
    {
      users(where: { address: "${address}" }) {
        annualPercentageReturn
        annualReturn
        cumulativeCalculatedSlash
        cumulativeCalculatedSlashPercentage
        countReveals
        countNoVotes
        countWrongVotes
        countCorrectVotes
        votesSlashed(first:${first}, skip: ${skip}) {
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
};

export async function getUserVotingAndStakingDetails(
  address: string | undefined
): Promise<UserDataT> {
  if (!graphEndpoint) throw new Error("V2 subgraph is disabled");

  if (!address)
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

  let skip = 0;
  const first = DEFAULT_PAGE_SIZE;
  const result = await request<UserDataQuery>(
    graphEndpoint,
    getUserDataQuery(address, first, skip)
  );
  skip += first;

  while (result.users[0].votesSlashed.length === first) {
    const nextResult = await request<UserDataQuery>(
      graphEndpoint,
      getUserDataQuery(address, first, skip)
    );
    result.users[0].votesSlashed.push(...nextResult.users[0].votesSlashed);
    skip += first;

    // Fail-safe to avoid potential infinite loop
    if (skip > MAX_ALLOWED_SKIP) {
      throw new Error("Exceeded maximum allowed skip limit");
    }
  }

  const userData = parseUserVotingAndStakingDetails(result.users[0]);

  return userData;
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
