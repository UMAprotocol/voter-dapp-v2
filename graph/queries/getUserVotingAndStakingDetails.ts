import graphEndpoint from "constants/graphEndpoint";
import request, { gql } from "graphql-request";
import { bigNumberFromDecimal } from "helpers/formatNumber";
import { UserDataQuery, UserDataT, VoteHistoryByKeyT, VoteHistoryT } from "types/global";

export async function getUserVotingAndStakingDetails(address: string | undefined) {
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
        votesSlashed {
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

function parseUserVotingAndStakingDetails(rawUserData: UserDataQuery["users"][0]) {
  const apr = bigNumberFromDecimal(rawUserData?.annualPercentageReturn ?? 0);
  const countReveals = parseInt(rawUserData?.countReveals ?? 0);
  const countNoVotes = parseInt(rawUserData?.countNoVotes ?? 0);
  const countWrongVotes = parseInt(rawUserData?.countWrongVotes ?? 0);
  const countCorrectVotes = parseInt(rawUserData?.countCorrectVotes ?? 0);
  const cumulativeCalculatedSlash = bigNumberFromDecimal(rawUserData?.cumulativeCalculatedSlash ?? 0);
  const cumulativeCalculatedSlashPercentage = bigNumberFromDecimal(
    rawUserData?.cumulativeCalculatedSlashPercentage ?? 0
  );
  const voteHistory = rawUserData?.votesSlashed.map((vote) => {
    const uniqueKey = vote.request.id;
    const voted = vote.voted;
    const correctness = vote.correctness;
    const slashAmount = bigNumberFromDecimal(vote.slashAmount ?? 0);
    const staking = vote.staking;
    return { uniqueKey, voted, correctness, slashAmount, staking };
  });
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
  } as UserDataT;
}

function makeVoteHistoryByKey(voteHistory: VoteHistoryT[] | undefined) {
  if (!voteHistory) return {};

  const voteHistoryByKey: VoteHistoryByKeyT = {};
  voteHistory.forEach((vote) => {
    voteHistoryByKey[vote.uniqueKey] = vote;
  });

  return voteHistoryByKey;
}
