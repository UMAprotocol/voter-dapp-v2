export type PastVotesQuery = {
  priceRequests: {
    id: string;
    identifier: {
      id: string;
    };
    time: string;
    price: string;
    ancillaryData: string;
    requestIndex: string;
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
