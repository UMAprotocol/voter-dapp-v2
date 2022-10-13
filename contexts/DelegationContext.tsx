import { zeroAddress } from "helpers";
import {
  useDelegateSetEventsForDelegate,
  useDelegateSetEventsForDelegator,
  useDelegateToStaker,
  useDelegatorSetEvents,
  useDelegatorSetEventsForDelegator,
  useStakingContext,
  useUserContext,
  useVoterFromDelegate,
} from "hooks";
import { createContext, ReactNode } from "react";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";

export interface DelegationContextState {
  getDelegationStatus: () => DelegationStatusT;
  getPendingSetDelegateRequestsForDelegate: () => DelegationEventT[];
  getHasPendingSetDelegateRequestsForDelegate: () => boolean;
  getPendingSetDelegateRequestsForDelegator: () => DelegationEventT[];
  getHasPendingSetDelegateRequestsForDelegator: () => boolean;
  getDelegateAddress: () => string;
  getDelegatorAddress: () => string;
  addDelegate: (delegateAddress: string) => void;
  removeDelegate: (delegateAddress: string) => void;
  addDelegator: (delegatorAddress: string) => void;
  removeDelegator: (delegatorAddress: string) => void;
  acceptDelegatorRequest: (delegatorAddress: string) => void;
  ignoreDelegatorRequest: (transactionHash: string) => void;
  acceptDelegateRequest: (delegateAddress: string) => void;
  cancelDelegateRequest: (transactionHash: string) => void;
  getDelegationDataLoading: () => boolean;
  getDelegationDataFetching: () => boolean;
}

export const defaultDelegationContextState: DelegationContextState = {
  getDelegationStatus: () => "no-wallet-connected",
  getPendingSetDelegateRequestsForDelegate: () => [],
  getHasPendingSetDelegateRequestsForDelegate: () => false,
  getPendingSetDelegateRequestsForDelegator: () => [],
  getHasPendingSetDelegateRequestsForDelegator: () => false,
  getDelegateAddress: () => zeroAddress,
  getDelegatorAddress: () => zeroAddress,
  addDelegate: () => null,
  removeDelegate: () => null,
  addDelegator: () => null,
  removeDelegator: () => null,
  acceptDelegatorRequest: () => null,
  ignoreDelegatorRequest: () => null,
  acceptDelegateRequest: () => null,
  cancelDelegateRequest: () => null,
  getDelegationDataLoading: () => false,
  getDelegationDataFetching: () => false,
};

export const DelegationContext = createContext<DelegationContextState>(defaultDelegationContextState);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const {
    data: delegateSetEventsForDelegate,
    isLoading: delegateSetEventsForDelegateLoading,
    isFetching: delegateSetEventsForDelegateFetching,
  } = useDelegateSetEventsForDelegate();
  const {
    data: delegateSetEventsForDelegator,
    isLoading: delegateSetEventsForDelegatorLoading,
    isFetching: delegateSetEventsForDelegatorFetching,
  } = useDelegateSetEventsForDelegator();
  const {
    data: delegatorSetEvents,
    isLoading: delegatorSetEventsLoading,
    isFetching: delegatorSetEventsFetching,
  } = useDelegatorSetEvents();
  const {
    data: delegatorSetEventsForDelegator,
    isLoading: delegatorSetEventsForDelegatorLoading,
    isFetching: delegatorSetEventsForDelegatorFetching,
  } = useDelegatorSetEventsForDelegator();
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
  const { delegate } = useStakingContext();

  function getDelegationDataLoading() {
    return (
      delegateSetEventsForDelegateLoading ||
      delegateSetEventsForDelegatorLoading ||
      delegatorSetEventsLoading ||
      voterFromDelegateLoading ||
      delegateToStakerLoading ||
      delegatorSetEventsForDelegatorLoading
    );
  }

  function getDelegationDataFetching() {
    return (
      delegateSetEventsForDelegateFetching ||
      delegateSetEventsForDelegatorFetching ||
      delegatorSetEventsFetching ||
      voterFromDelegateFetching ||
      delegateToStakerFetching ||
      delegatorSetEventsForDelegatorFetching
    );
  }

  function getDelegateAddress() {
    const status = getDelegationStatus();
    if (status === "delegator") return delegate!;
    if (status === "delegate") return address;
    return zeroAddress;
  }

  function getDelegatorAddress() {
    const status = getDelegationStatus();
    if (status === "delegator") return address;
    if (status === "delegate") return voterFromDelegate;
    return zeroAddress;
  }

  function getDelegationStatus(): DelegationStatusT {
    if (!address) return "no-wallet-connected";
    // if you have neither `DelegatorSet` nor `DelegateSet` events, you are neither a delegate or a delegator
    if (
      !getHasDelegateSetEventsForDelegate() &&
      !getHasPendingSetDelegateRequestsForDelegator() &&
      !getHasDelegatorSetEvents()
    )
      return "no-delegation";
    // if there is a delegator set for your address, you are a delegate
    if (voterFromDelegate.toLowerCase() !== address.toLowerCase()) return "delegate";
    // if the `delegateToStaker` mapping for the `delegate` defined in your `voterStakes`, then you are a delegator
    if (address.toLowerCase() === delegateToStaker.toLowerCase()) return "delegator";
    if (getHasPendingSetDelegateRequestsForDelegate()) return "delegate-pending";
    if (getHasPendingSetDelegateRequestsForDelegator()) return "delegator-pending";
    return "no-delegation";
  }

  function getHasDelegateSetEventsForDelegate() {
    return delegateSetEventsForDelegate.length > 0;
  }

  function getHasDelegatorSetEvents() {
    return delegatorSetEvents.length > 0;
  }

  function getHasPendingSetDelegateRequestsForDelegate() {
    return getPendingSetDelegateRequestsForDelegate().length > 0;
  }

  function getHasPendingSetDelegateRequestsForDelegator() {
    return getPendingSetDelegateRequestsForDelegator().length > 0;
  }

  function getPendingSetDelegateRequestsForDelegate() {
    return (
      delegateSetEventsForDelegate?.filter(
        (delegateSet) =>
          !delegatorSetEvents?.some(
            (delegatorSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  function getPendingSetDelegateRequestsForDelegator() {
    return (
      delegateSetEventsForDelegator?.filter(
        (delegateSet) =>
          !delegatorSetEventsForDelegator?.some(
            (delegatorSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  function addDelegator(delegatorAddress: string) {
    return;
  }

  function removeDelegator(delegatorAddress: string) {
    return;
  }

  function addDelegate(delegateAddress: string) {
    return;
  }

  function removeDelegate(delegateAddress: string) {
    return;
  }

  function acceptDelegatorRequest(delegatorAddress: string) {
    return;
  }

  function cancelDelegateRequest(delegateAddress: string) {
    return;
  }

  function acceptDelegateRequest(delegateAddress: string) {
    return;
  }

  function ignoreDelegatorRequest(delegatorAddress: string) {
    const ignoredDelegatorRequests = JSON.parse(
      window.localStorage.get("ignoredDelegatorRequests") ?? "[]"
    ) as string[];

    if (!ignoredDelegatorRequests.includes(delegatorAddress)) {
      ignoredDelegatorRequests.push(delegatorAddress);
      window.localStorage.set("ignoredDelegatorRequests", JSON.stringify(ignoredDelegatorRequests));
    }
  }

  return (
    <DelegationContext.Provider
      value={{
        getDelegationStatus,
        getDelegateAddress,
        getDelegatorAddress,
        getPendingSetDelegateRequestsForDelegate,
        getHasPendingSetDelegateRequestsForDelegate,
        getPendingSetDelegateRequestsForDelegator,
        getHasPendingSetDelegateRequestsForDelegator,
        addDelegate,
        removeDelegate,
        addDelegator,
        removeDelegator,
        acceptDelegatorRequest,
        ignoreDelegatorRequest,
        acceptDelegateRequest,
        cancelDelegateRequest,
        getDelegationDataLoading,
        getDelegationDataFetching,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
