import { zeroAddress } from "helpers";
import {
  useDelegateSetEvents,
  useDelegateToStaker,
  useDelegatorSetEvents,
  useUserContext,
  useVoterFromDelegate,
} from "hooks";
import { createContext, ReactNode } from "react";
import { DelegationStatusT } from "types";

export interface DelegationContextState {
  getDelegationStatus: () => DelegationStatusT;
  getDelegateAddress: () => string;
  getDelegatorAddress: () => string;
  getDelegationDataLoading: () => boolean;
  getDelegationDataFetching: () => boolean;
}

export const defaultDelegationContextState: DelegationContextState = {
  getDelegationStatus: () => "none",
  getDelegateAddress: () => zeroAddress,
  getDelegatorAddress: () => zeroAddress,
  getDelegationDataLoading: () => false,
  getDelegationDataFetching: () => false,
};

export const DelegationContext = createContext<DelegationContextState>(defaultDelegationContextState);

export function DelegationProvider({ children }: { children: ReactNode }) {
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
  const {
    data: voterFromDelegate,
    isLoading: voterFromDelegateLoading,
    isFetching: voterFromDelegateFetching,
  } = useVoterFromDelegate();
  const {
    data: delegateToStaker,
    isLoading: delegateToStakerLoading,
    isFetching: delegateToStakerFetching,
  } = useDelegateToStaker();
  const { address } = useUserContext();

  function getDelegationDataLoading() {
    return delegateSetEventsLoading || delegatorSetEventsLoading || voterFromDelegateLoading || delegateToStakerLoading;
  }

  function getDelegationDataFetching() {
    return (
      delegateSetEventsFetching || delegatorSetEventsFetching || voterFromDelegateFetching || delegateToStakerFetching
    );
  }

  function getDelegateAddress() {}

  function getDelegatorAddress() {}

  function getDelegationStatus() {
    const hasDelegateSetEvents = getHasDelegateSetEvents();
    const hasDelegatorSetEvents = getHasDelegatorSetEvents();
    // if you have neither `DelegatorSet` nor `DelegateSet` events, you are neither a delegate or a delegator
    if (!hasDelegateSetEvents && !hasDelegatorSetEvents) return "none";
    // if there is a delegator set for your address, you are a delegate
    if (voterFromDelegate.toLowerCase() !== address.toLowerCase()) return "delegate";
    // if the `delegateToStaker` mapping for the `delegate` defined in your `voterStakes`, then you are a delegator
    if (address.toLowerCase() === delegateToStaker.toLowerCase()) return "delegator";
    return "none";
  }

  function getHasDelegateSetEvents() {
    return delegateSetEvents.length > 0;
  }

  function getHasDelegatorSetEvents() {
    return delegatorSetEvents.length > 0;
  }

  function getHasPendingSetDelegateRequests() {
    return getPendingSetDelegateRequests().length > 0;
  }

  function getPendingSetDelegateRequests() {
    return (
      delegateSetEvents?.filter(
        (delegateSet) =>
          !delegatorSetEvents?.some(
            (delegatorSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  return (
    <DelegationContext.Provider
      value={{
        getDelegationStatus,
        getDelegateAddress,
        getDelegatorAddress,
        getDelegationDataLoading,
        getDelegationDataFetching,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
