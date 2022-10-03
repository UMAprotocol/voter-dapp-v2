import { WalletState } from "@web3-onboard/core";
import { Account } from "@web3-onboard/core/dist/types";
import { BigNumber } from "ethers";
import { useAccountDetails, useUserData } from "hooks";
import { createContext, ReactNode } from "react";
import { VoteHistoryByKeyT } from "types/global";

interface UserContextState {
  connectedWallet: WalletState | undefined;
  account: Account | undefined;
  address: string;
  truncatedAddress: string | undefined;
  apr: BigNumber | undefined;
  countReveals: number | undefined;
  countNoVotes: number | undefined;
  countWrongVotes: number | undefined;
  countCorrectVotes: number | undefined;
  cumulativeCalculatedSlash: BigNumber | undefined;
  cumulativeCalculatedSlashPercentage: BigNumber | undefined;
  voteHistoryByKey: VoteHistoryByKeyT;
  userDataLoading: boolean;
  userDataFetching: boolean;
}

export const defaultUserContextState: UserContextState = {
  connectedWallet: undefined,
  account: undefined,
  address: "",
  truncatedAddress: undefined,
  apr: undefined,
  countReveals: undefined,
  countNoVotes: undefined,
  countWrongVotes: undefined,
  countCorrectVotes: undefined,
  cumulativeCalculatedSlash: undefined,
  cumulativeCalculatedSlashPercentage: undefined,
  voteHistoryByKey: {},
  userDataLoading: false,
  userDataFetching: false,
};

export const UserContext = createContext<UserContextState>(defaultUserContextState);

export function UserProvider({ children }: { children: ReactNode }) {
  const { connectedWallet, account, address, truncatedAddress } = useAccountDetails();
  const {
    data: {
      apr,
      countNoVotes,
      countWrongVotes,
      countCorrectVotes,
      countReveals,
      cumulativeCalculatedSlash,
      cumulativeCalculatedSlashPercentage,
      voteHistoryByKey,
    },
    isLoading: userDataLoading,
    isFetching: userDataFetching,
  } = useUserData();

  return (
    <UserContext.Provider
      value={{
        connectedWallet,
        account,
        address,
        truncatedAddress,
        apr,
        countReveals,
        countNoVotes,
        countWrongVotes,
        countCorrectVotes,
        cumulativeCalculatedSlash,
        cumulativeCalculatedSlashPercentage,
        voteHistoryByKey,
        userDataLoading,
        userDataFetching,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
