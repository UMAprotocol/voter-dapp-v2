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
const { graphEndpoint } = config;

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

  const userDataQuery = gql`
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
        votesSlashed(first: 1000) {
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

  const result = await request<UserDataQuery>(graphEndpoint, userDataQuery);
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
