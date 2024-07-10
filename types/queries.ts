export type PastVotesQuery = {
  priceRequests: {
    identifier: {
      id: string;
    };
    time: string;
    price: string;
    ancillaryData: string;
    resolvedPriceRequestIndex: string;
    latestRound: {
      totalVotesRevealed: string;
      groups: {
        price: string;
        totalVoteAmount: string;
      }[];
      committedVotes: {
        id: string;
        voter: {
          voterStake: string;
        };
      }[];
      revealedVotes: {
        id: string;
        voter: {
          address: string;
        };
        price: string;
      }[];
    };
    committedVotes: {
      id: string;
    }[];
    revealedVotes: {
      id: string;
      voter: {
        address: string;
      };
      price: string;
    }[];
  }[];
};

export type UserDataQuery = {
  users: {
    annualPercentageReturn: string;
    countReveals: string;
    countNoVotes: string;
    countWrongVotes: string;
    countCorrectVotes: string;
    cumulativeCalculatedSlash: string;
    cumulativeCalculatedSlashPercentage: string;
    votesSlashed: {
      request: { id: string };
      voted: boolean;
      correctness: boolean;
      staking: boolean;
      slashAmount: string;
    }[];
  }[];
};
