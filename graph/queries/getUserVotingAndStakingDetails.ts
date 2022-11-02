import { graphEndpoint } from "constant";
import request, { gql } from "graphql-request";
import { bigNumberFromFloatString } from "helpers";
import { UserDataQuery, UserDataT, VoteHistoryByKeyT, VoteHistoryT } from "types";

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

function parseUserVotingAndStakingDetails(rawUserData: UserDataQuery["users"][0] | undefined) {
  const apr = bigNumberFromFloatString(rawUserData?.annualPercentageReturn);
  const countReveals = bigNumberFromFloatString(rawUserData?.countReveals);
  const countNoVotes = bigNumberFromFloatString(rawUserData?.countNoVotes);
  const countWrongVotes = bigNumberFromFloatString(rawUserData?.countWrongVotes);
  const countCorrectVotes = bigNumberFromFloatString(rawUserData?.countCorrectVotes);
  const cumulativeCalculatedSlash = bigNumberFromFloatString(rawUserData?.cumulativeCalculatedSlash);
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
