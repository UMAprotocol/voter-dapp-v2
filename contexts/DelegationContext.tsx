import { zeroAddress } from "helpers/ethers";
import { useDelegateSetEvents, useDelegatorSetEvents } from "hooks";
import { createContext, ReactNode, useState } from "react";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";

export interface DelegationContextState {
  delegationStatus: DelegationStatusT;
  delegatorAddress: string | undefined;
  delegateAddress: string | undefined;
  getPendingSetDelegateRequests: () => DelegationEventT[];
  getPendingSetDelegatorRequests: () => DelegationEventT[];
  getDelegationDataLoading: () => boolean;
  getDelegationDataFetching: () => boolean;
}

export const defaultDelegationContextState: DelegationContextState = {
  delegationStatus: "none",
  delegatorAddress: undefined,
  delegateAddress: undefined,
  getPendingSetDelegateRequests: () => [],
  getPendingSetDelegatorRequests: () => [],
  getDelegationDataLoading: () => false,
  getDelegationDataFetching: () => false,
};

export const DelegationContext = createContext<DelegationContextState>(defaultDelegationContextState);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const [delegationStatus, setDelegationStatus] = useState<DelegationStatusT>("none");
  const [delegatorAddress, setDelegatorAddress] = useState<string | undefined>(undefined);
  const [delegateAddress, setDelegateAddress] = useState<string | undefined>(undefined);
  const {
    data: delegateSetEvents,
    isLoading: delegateSetEventsLoading,
    isFetching: delegateSetEventsFetching,
  } = useDelegateSetEvents();
  const {
    data: delegatorSetEvents,
    isLoading: delegatorSetEventsLoading,
    isFetching: delegatorSetEventsFetching,
  } = useDelegatorSetEvents();

  function getDelegationDataLoading() {
    return delegateSetEventsLoading || delegatorSetEventsLoading;
  }

  function getDelegationDataFetching() {
    return delegateSetEventsFetching || delegatorSetEventsFetching;
  }

  function getPendingSetDelegateRequests() {
    return (
      delegateSetEvents?.filter(
        (delegateSet) =>
          delegateSet.delegate !== zeroAddress && // filter out the cancel delegations events
          !delegatorSetEvents?.some(
            (delegatorSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  function getPendingSetDelegatorRequests() {
    return (
      delegatorSetEvents?.filter(
        (delegatorSet) =>
          delegatorSet.delegator !== zeroAddress && // filter out the cancel delegations events
          !delegateSetEvents?.some(
            (delegateSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  return (
    <DelegationContext.Provider
      value={{
        delegationStatus,
        delegatorAddress,
        delegateAddress,
        getPendingSetDelegateRequests,
        getPendingSetDelegatorRequests,
        getDelegationDataLoading,
        getDelegationDataFetching,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
