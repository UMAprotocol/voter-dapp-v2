import { zeroAddress } from "helpers";
import {
  useAcceptReceivedRequestToBeDelegate,
  useCancelSentRequestToBeDelegate,
  useContractsContext,
  useDelegateToStaker,
  useDelegatorSetEventsForDelegate,
  useDelegatorSetEventsForDelegator,
  useIgnoredRequestToBeDelegateAddresses,
  useIgnoreReceivedRequestToBeDelegate,
  usePanelContext,
  useReceivedRequestsToBeDelegate,
  useSendRequestToBeDelegate,
  useSentRequestsToBeDelegate,
  useStakingContext,
  useTerminateRelationshipWithDelegate,
  useTerminateRelationshipWithDelegator,
  useUserContext,
  useVoterFromDelegate,
} from "hooks";
import { createContext, ReactNode } from "react";
import { DelegationEventT, DelegationStatusT } from "types";
export interface DelegationContextState {
  getDelegationStatus: () => DelegationStatusT;
  getPendingReceivedRequestsToBeDelegate: () => DelegationEventT[];
  getHasPendingReceivedRequestsToBeDelegate: () => boolean;
  getPendingSentRequestsToBeDelegate: () => DelegationEventT[];
  getHasPendingSentRequestsToBeDelegate: () => boolean;
  getDelegateAddress: () => string | undefined;
  getDelegatorAddress: () => string | undefined;
  sendRequestToBeDelegate: (delegateAddress: string) => void;
  cancelSentRequestToBeDelegate: () => void;
  acceptReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  ignoreReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  terminateRelationshipWithDelegate: () => void;
  terminateRelationshipWithDelegator: () => void;
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
    data: receivedRequestsToBeDelegate,
    isLoading: receivedRequestsToBeDelegateLoading,
    isFetching: receivedRequestsToBeDelegateFetching,
  } = useReceivedRequestsToBeDelegate();
  const {
    data: sentRequestsToBeDelegate,
    isLoading: sentRequestsToBeDelegateLoading,
    isFetching: sentRequestsToBeDelegateFetching,
  } = useSentRequestsToBeDelegate();
  const {
    data: delegatorSetEventsForDelegate,
    isLoading: delegatorSetEventsForDelegateLoading,
    isFetching: delegatorSetEventsForDelegateFetching,
  } = useDelegatorSetEventsForDelegate();
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
  const { sendRequestToBeDelegateMutation, isSendingRequestToBeDelegate } = useSendRequestToBeDelegate();
  const { cancelSentRequestToBeDelegateMutation, isCancelingSentRequestToBeDelegate } =
    useCancelSentRequestToBeDelegate();
  const { acceptReceivedRequestToBeDelegateMutation, isAcceptingReceivedRequestToBeDelegate } =
    useAcceptReceivedRequestToBeDelegate();
  const { terminateRelationshipWithDelegateMutation, isTerminatingRelationshipWithDelegate } =
    useTerminateRelationshipWithDelegate();
  const { terminateRelationshipWithDelegatorMutation, isTerminatingRelationshipWithDelegator } =
    useTerminateRelationshipWithDelegator();
  const { voting } = useContractsContext();
  const { address } = useUserContext();
  const { delegate } = useStakingContext();
  const { closePanel } = usePanelContext();

  function getDelegationDataLoading() {
    return (
      receivedRequestsToBeDelegateLoading ||
      sentRequestsToBeDelegateLoading ||
      delegatorSetEventsForDelegateLoading ||
      voterFromDelegateLoading ||
      delegateToStakerLoading ||
      delegatorSetEventsForDelegatorLoading ||
      ignoredRequestToBeDelegateAddressesLoading ||
      isIgnoringRequestToBeDelegate ||
      isSendingRequestToBeDelegate ||
      isCancelingSentRequestToBeDelegate ||
      isAcceptingReceivedRequestToBeDelegate ||
      isTerminatingRelationshipWithDelegate ||
      isTerminatingRelationshipWithDelegator
    );
  }

  function getDelegationDataFetching() {
    return (
      receivedRequestsToBeDelegateFetching ||
      sentRequestsToBeDelegateFetching ||
      delegatorSetEventsForDelegateFetching ||
      voterFromDelegateFetching ||
      delegateToStakerFetching ||
      delegatorSetEventsForDelegatorFetching ||
      ignoredRequestToBeDelegateAddressesFetching ||
      isIgnoringRequestToBeDelegate ||
      isSendingRequestToBeDelegate ||
      isCancelingSentRequestToBeDelegate ||
      isAcceptingReceivedRequestToBeDelegate ||
      isTerminatingRelationshipWithDelegate ||
      isTerminatingRelationshipWithDelegator
    );
  }

  function getDelegateAddress() {
    const status = getDelegationStatus();
    if (status === "delegator") return delegate;
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
      !getHasReceivedRequestsToBeDelegate() &&
      !getHasPendingSentRequestsToBeDelegate() &&
      !getHasDelegatorSetEvents()
    )
      return "no-delegation";
    // if there is a delegator set for your address, you are a delegate
    if (voterFromDelegate.toLowerCase() !== address.toLowerCase()) return "delegate";
    // if the `delegateToStaker` mapping for the `delegate` defined in your `voterStakes`, then you are a delegator
    if (address.toLowerCase() === delegateToStaker.toLowerCase()) return "delegator";
    // if the user has received a request to be another wallet's delegate but they have not accepted any, then they are a pending delegate
    if (getHasPendingReceivedRequestsToBeDelegate()) return "delegate-pending";
    // if the user has sent a request to be another wallet's delegate but the other wallet has not yet accepted, then they are a pending delegator
    if (getHasPendingSentRequestsToBeDelegate()) return "delegator-pending";
    // if none are true we assume the user has no delegation
    return "no-delegation";
  }

  function getHasReceivedRequestsToBeDelegate() {
    return receivedRequestsToBeDelegate.length > 0;
  }

  function getHasDelegatorSetEvents() {
    return delegatorSetEventsForDelegate.length > 0;
  }

  function getHasPendingReceivedRequestsToBeDelegate() {
    return getPendingReceivedRequestsToBeDelegate().length > 0;
  }

  function getHasPendingSentRequestsToBeDelegate() {
    const pendingSentRequestsToBeDelegate = getPendingSentRequestsToBeDelegate();
    const mostRecentSentRequestToBeDelegate = pendingSentRequestsToBeDelegate.at(-1);
    return mostRecentSentRequestToBeDelegate?.delegate !== zeroAddress && pendingSentRequestsToBeDelegate.length > 0;
  }

  function getPendingReceivedRequestsToBeDelegate() {
    return (
      receivedRequestsToBeDelegate
        ?.filter(
          (delegateSet) =>
            !delegatorSetEventsForDelegate?.some(
              (delegatorSet) =>
                delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
            )
        )
        ?.filter(({ delegator }) => !ignoredRequestToBeDelegateAddresses?.includes(delegator)) ?? []
    );
  }

  function getPendingSentRequestsToBeDelegate() {
    return (
      sentRequestsToBeDelegate?.filter(
        (delegateSet) =>
          !delegatorSetEventsForDelegator?.some(
            (delegatorSet) =>
              delegatorSet.delegate == delegateSet.delegate && delegatorSet.delegator == delegatorSet.delegator
          )
      ) ?? []
    );
  }

  function sendRequestToBeDelegate(delegateAddress: string) {
    sendRequestToBeDelegateMutation(
      {
        voting,
        delegateAddress,
      },
      {
        onSuccess: () => closePanel(),
      }
    );
  }

  function cancelSentRequestToBeDelegate() {
    cancelSentRequestToBeDelegateMutation({
      voting,
    });
  }

  function acceptReceivedRequestToBeDelegate(delegatorAddress: string) {
    acceptReceivedRequestToBeDelegateMutation({
      voting,
      delegatorAddress,
    });
  }

  function ignoreReceivedRequestToBeDelegate(delegatorAddress: string) {
    ignoreReceivedRequestToBeDelegateMutation({ userAddress: address, delegatorAddress });
  }

  function terminateRelationshipWithDelegator() {
    terminateRelationshipWithDelegatorMutation({
      voting,
    });
  }

  function terminateRelationshipWithDelegate() {
    terminateRelationshipWithDelegateMutation({
      voting,
    });
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