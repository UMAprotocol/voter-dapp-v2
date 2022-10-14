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
import { useIgnoreReceivedRequestToBeDelegate } from "hooks/mutations/delegation/useIgnoreRequestToBeDelegate";
import { useIgnoredRequestToBeDelegateAddresses } from "hooks/queries/delegation/useIgnoredRequestToBeDelegateAddresses";
import { createContext, ReactNode } from "react";
import { DelegationStatusT } from "types";
import { DelegationEventT } from "types/global";

export interface DelegationContextState {
  getDelegationStatus: () => DelegationStatusT;
  getPendingReceivedRequestsToBeDelegate: () => DelegationEventT[];
  getHasPendingReceivedRequestsToBeDelegate: () => boolean;
  getPendingSentRequestsToBeDelegate: () => DelegationEventT[];
  getHasPendingSentRequestsToBeDelegate: () => boolean;
  getDelegateAddress: () => string;
  getDelegatorAddress: () => string;
  sendRequestToBeDelegate: (delegateAddress: string) => void;
  terminateRelationshipWithDelegate: (delegateAddress: string) => void;
  terminateRelationshipWithDelegator: (delegatorAddress: string) => void;
  acceptReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  ignoreReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  cancelSentRequestToBeDelegate: () => void;
  getDelegationDataLoading: () => boolean;
  getDelegationDataFetching: () => boolean;
}

export const defaultDelegationContextState: DelegationContextState = {
  getDelegationStatus: () => "no-wallet-connected",
  getPendingReceivedRequestsToBeDelegate: () => [],
  getHasPendingReceivedRequestsToBeDelegate: () => false,
  getPendingSentRequestsToBeDelegate: () => [],
  getHasPendingSentRequestsToBeDelegate: () => false,
  getDelegateAddress: () => zeroAddress,
  getDelegatorAddress: () => zeroAddress,
  sendRequestToBeDelegate: () => null,
  terminateRelationshipWithDelegate: () => null,
  terminateRelationshipWithDelegator: () => null,
  acceptReceivedRequestToBeDelegate: () => null,
  ignoreReceivedRequestToBeDelegate: () => null,
  cancelSentRequestToBeDelegate: () => null,
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
  const {
    data: ignoredRequestToBeDelegateAddresses,
    isLoading: ignoredRequestToBeDelegateAddressesLoading,
    isFetching: ignoredRequestToBeDelegateAddressesFetching,
  } = useIgnoredRequestToBeDelegateAddresses();
  const { ignoreReceivedRequestToBeDelegateMutation, isIgnoringRequestToBeDelegate } =
    useIgnoreReceivedRequestToBeDelegate();
  const { address } = useUserContext();
  const { delegate } = useStakingContext();

  function getDelegationDataLoading() {
    return (
      delegateSetEventsForDelegateLoading ||
      delegateSetEventsForDelegatorLoading ||
      delegatorSetEventsLoading ||
      voterFromDelegateLoading ||
      delegateToStakerLoading ||
      delegatorSetEventsForDelegatorLoading ||
      ignoredRequestToBeDelegateAddressesLoading ||
      isIgnoringRequestToBeDelegate
    );
  }

  function getDelegationDataFetching() {
    return (
      delegateSetEventsForDelegateFetching ||
      delegateSetEventsForDelegatorFetching ||
      delegatorSetEventsFetching ||
      voterFromDelegateFetching ||
      delegateToStakerFetching ||
      delegatorSetEventsForDelegatorFetching ||
      ignoredRequestToBeDelegateAddressesFetching ||
      isIgnoringRequestToBeDelegate
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
      !getHasPendingSentRequestsToBeDelegate() &&
      !getHasDelegatorSetEvents()
    )
      return "no-delegation";
    // if there is a delegator set for your address, you are a delegate
    if (voterFromDelegate.toLowerCase() !== address.toLowerCase()) return "delegate";
    // if the `delegateToStaker` mapping for the `delegate` defined in your `voterStakes`, then you are a delegator
    if (address.toLowerCase() === delegateToStaker.toLowerCase()) return "delegator";
    if (getHasPendingReceivedRequestsToBeDelegate()) return "delegate-pending";
    if (getHasPendingSentRequestsToBeDelegate()) return "delegator-pending";
    return "no-delegation";
  }

  function getHasDelegateSetEventsForDelegate() {
    return delegateSetEventsForDelegate.length > 0;
  }

  function getHasDelegatorSetEvents() {
    return delegatorSetEvents.length > 0;
  }

  function getHasPendingReceivedRequestsToBeDelegate() {
    return getPendingReceivedRequestsToBeDelegate().length > 0;
  }

  function getHasPendingSentRequestsToBeDelegate() {
    return getPendingSentRequestsToBeDelegate().length > 0;
  }

  function getPendingReceivedRequestsToBeDelegate() {
    return (
      delegateSetEventsForDelegate
        ?.filter(
          (delegateSet) =>
            !delegatorSetEvents?.some(
              (delegatorSet) =>
                delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
            )
        )
        ?.filter(({ delegator }) => !ignoredRequestToBeDelegateAddresses?.includes(delegator)) ?? []
    );
  }

  function getPendingSentRequestsToBeDelegate() {
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

  function terminateRelationshipWithDelegator(delegatorAddress: string) {
    return;
  }

  function sendRequestToBeDelegate(delegateAddress: string) {
    return;
  }

  function terminateRelationshipWithDelegate(delegateAddress: string) {
    return;
  }

  function acceptReceivedRequestToBeDelegate(delegatorAddress: string) {
    return;
  }

  function cancelSentRequestToBeDelegate() {
    return;
  }

  function acceptDelegateRequest(delegateAddress: string) {
    return;
  }

  function ignoreReceivedRequestToBeDelegate(delegatorAddress: string) {
    ignoreReceivedRequestToBeDelegateMutation({ userAddress: address, delegatorAddress });
  }

  return (
    <DelegationContext.Provider
      value={{
        getDelegationStatus,
        getDelegateAddress,
        getDelegatorAddress,
        getPendingReceivedRequestsToBeDelegate,
        getHasPendingReceivedRequestsToBeDelegate,
        getPendingSentRequestsToBeDelegate,
        getHasPendingSentRequestsToBeDelegate,
        sendRequestToBeDelegate,
        terminateRelationshipWithDelegate,
        terminateRelationshipWithDelegator,
        acceptReceivedRequestToBeDelegate,
        ignoreReceivedRequestToBeDelegate,
        cancelSentRequestToBeDelegate,
        getDelegationDataLoading,
        getDelegationDataFetching,
      }}
    >
      {children}
    </DelegationContext.Provider>
  );
}
