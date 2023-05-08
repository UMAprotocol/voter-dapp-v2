import { WalletState } from "@web3-onboard/core";
import { Account } from "@web3-onboard/core/dist/types";
import { BigNumber } from "ethers";
import { config } from "helpers/config";
import {
  useAccountDetails,
  useUserVotingAndStakingDetails,
  useWalletContext,
} from "hooks";
import { ReactNode, createContext, useMemo, useState } from "react";
import { SigningKey, VoteHistoryByKeyT } from "types";

export interface UserContextState {
  connectedWallet: WalletState | undefined;
  account: Account | undefined;
  address: string | undefined;
  hasAddress: boolean;
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
  correctChainConnected: boolean;
  setAddressOverride: (address?: string) => void;
}

export const defaultUserContextState: UserContextState = {
  connectedWallet: undefined,
  account: undefined,
  address: undefined,
  hasAddress: false,
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
  correctChainConnected: true,
  setAddressOverride: () => undefined,
};

export const UserContext = createContext<UserContextState>(
  defaultUserContextState
);

export function UserProvider({ children }: { children: ReactNode }) {
  const { connectedWallet, account, address, truncatedAddress } =
    useAccountDetails();
  const [addressOverride, setAddressOverride] = useState<string | undefined>(
    undefined
  );
  const { signingKeys, connectedChainId } = useWalletContext();
  const {
    data: votingAndStakingDetails,
    isLoading: userDataLoading,
    isFetching: userDataFetching,
  } = useUserVotingAndStakingDetails(addressOverride);
  const {
    apr,
    countNoVotes,
    countWrongVotes,
    countCorrectVotes,
    countReveals,
    cumulativeCalculatedSlash,
    cumulativeCalculatedSlashPercentage,
    voteHistoryByKey,
  } = votingAndStakingDetails || {};

  const hasAddress = !!addressOverride || !!address;
  const walletIcon = connectedWallet?.icon;
  const signingKey = !!address ? signingKeys[address] : undefined;
  const correctChainConnected = connectedChainId === config.chainId;

  const value = useMemo(
    () => ({
      connectedWallet,
      account,
      address,
      hasAddress,
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
      correctChainConnected,
      setAddressOverride,
    }),
    [
      account,
      address,
      hasAddress,
      apr,
      connectedWallet,
      correctChainConnected,
      countCorrectVotes,
      countNoVotes,
      countReveals,
      countWrongVotes,
      cumulativeCalculatedSlash,
      cumulativeCalculatedSlashPercentage,
      signingKey,
      truncatedAddress,
      userDataFetching,
      userDataLoading,
      voteHistoryByKey,
      walletIcon,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
