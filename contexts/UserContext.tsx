import { WalletState } from "@web3-onboard/core";
import { Account } from "@web3-onboard/core/dist/types";
import { BigNumber } from "ethers";
import {
  useAccountDetails,
  useUserVotingAndStakingDetails,
  useWalletContext,
} from "hooks";
import { createContext, ReactNode } from "react";
import { VoteHistoryByKeyT, SigningKey } from "types";

export interface UserContextState {
  connectedWallet: WalletState | undefined;
  account: Account | undefined;
  address: string;
  truncatedAddress: string | undefined;
  walletIcon?: string | undefined;
  apr: BigNumber | undefined;
  countReveals: BigNumber | undefined;
  countNoVotes: BigNumber | undefined;
  countWrongVotes: BigNumber | undefined;
  countCorrectVotes: BigNumber | undefined;
  cumulativeCalculatedSlash: BigNumber | undefined;
  cumulativeCalculatedSlashPercentage: BigNumber | undefined;
  voteHistoryByKey: VoteHistoryByKeyT | undefined;
  userDataLoading: boolean;
  userDataFetching: boolean;
  signingKey: SigningKey | undefined;
  hasSigningKey: boolean;
}

export const defaultUserContextState: UserContextState = {
  connectedWallet: undefined,
  account: undefined,
  address: "",
  truncatedAddress: undefined,
  walletIcon: undefined,
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
  signingKey: undefined,
  hasSigningKey: false,
};

export const UserContext = createContext<UserContextState>(
  defaultUserContextState
);

export function UserProvider({ children }: { children: ReactNode }) {
  const { connectedWallet, account, address, truncatedAddress } =
    useAccountDetails();
  const { signingKeys } = useWalletContext();

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
  } = useUserVotingAndStakingDetails();

  const walletIcon = connectedWallet?.icon;
  const signingKey = signingKeys[address];

  return (
    <UserContext.Provider
      value={{
        connectedWallet,
        account,
        address,
        truncatedAddress,
        walletIcon,
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
        signingKey,
        hasSigningKey: !!signingKey,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
