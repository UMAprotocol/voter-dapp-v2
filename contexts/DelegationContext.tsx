import { BigNumber } from "ethers";
import {
  calculateOutstandingRewards,
  getAddress,
  truncateEthAddress,
  zeroAddress,
} from "helpers";
import {
  useAcceptReceivedRequestToBeDelegate,
  useAccountDetails,
  useCancelSentRequestToBeDelegate,
  useContractsContext,
  useDelegateToStaker,
  useDelegatorSetEventsForDelegate,
  useDelegatorSetEventsForDelegator,
  useIgnoreReceivedRequestToBeDelegate,
  useIgnoredRequestToBeDelegateAddresses,
  useInterval,
  usePanelContext,
  useReceivedRequestsToBeDelegate,
  useRewardsCalculationInputs,
  useSendRequestToBeDelegate,
  useSentRequestsToBeDelegate,
  useStakedBalance,
  useStakerDetails,
  useTerminateRelationshipWithDelegate,
  useTerminateRelationshipWithDelegator,
  useVoterFromDelegate,
} from "hooks";
import {
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { DelegationEventT, DelegationStatusT } from "types";
export interface DelegationContextState {
  delegationStatus: DelegationStatusT;
  isNoWalletConnected: boolean;
  isNoDelegation: boolean;
  isDelegate: boolean;
  isDelegator: boolean;
  isDelegatePending: boolean;
  isDelegatorPending: boolean;
  delegateAddress: string | undefined;
  delegatorAddress: string | undefined;
  pendingReceivedRequestsToBeDelegate: DelegationEventT[];
  hasPendingReceivedRequestsToBeDelegate: boolean;
  pendingSentRequestsToBeDelegate: DelegationEventT[];
  hasPendingSentRequestsToBeDelegate: boolean;
  sendRequestToBeDelegate: (delegateAddress: string) => void;
  cancelSentRequestToBeDelegate: () => void;
  acceptReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  ignoreReceivedRequestToBeDelegate: (delegatorAddress: string) => void;
  terminateRelationshipWithDelegate: () => void;
  terminateRelationshipWithDelegator: () => void;
  isLoading: boolean;
  isMutating: boolean;
  isBusy: boolean;
  receivedRequestsToBeDelegateLoading: boolean;
  sentRequestsToBeDelegateLoading: boolean;
  delegatorSetEventsForDelegateLoading: boolean;
  voterFromDelegateLoading: boolean;
  delegateToStakerLoading: boolean;
  delegatorSetEventsForDelegatorLoading: boolean;
  ignoredRequestToBeDelegateAddressesLoading: boolean;
  isIgnoringRequestToBeDelegate: boolean;
  isSendingRequestToBeDelegate: boolean;
  isCancelingSentRequestToBeDelegate: boolean;
  isAcceptingReceivedRequestToBeDelegate: boolean;
  isTerminatingRelationshipWithDelegate: boolean;
  isTerminatingRelationshipWithDelegator: boolean;
  outstandingRewards: BigNumber;
}

export const defaultDelegationContextState: DelegationContextState = {
  delegationStatus: "no-wallet-connected",
  isNoWalletConnected: true,
  isNoDelegation: false,
  isDelegatePending: false,
  isDelegatorPending: false,
  isDelegate: false,
  isDelegator: false,
  delegateAddress: undefined,
  delegatorAddress: undefined,
  pendingReceivedRequestsToBeDelegate: [],
  hasPendingReceivedRequestsToBeDelegate: false,
  pendingSentRequestsToBeDelegate: [],
  hasPendingSentRequestsToBeDelegate: false,
  sendRequestToBeDelegate: () => null,
  terminateRelationshipWithDelegate: () => null,
  terminateRelationshipWithDelegator: () => null,
  acceptReceivedRequestToBeDelegate: () => null,
  ignoreReceivedRequestToBeDelegate: () => null,
  cancelSentRequestToBeDelegate: () => null,
  isLoading: false,
  isMutating: false,
  isBusy: false,
  receivedRequestsToBeDelegateLoading: false,
  sentRequestsToBeDelegateLoading: false,
  delegatorSetEventsForDelegateLoading: false,
  voterFromDelegateLoading: false,
  delegateToStakerLoading: false,
  delegatorSetEventsForDelegatorLoading: false,
  ignoredRequestToBeDelegateAddressesLoading: false,
  isIgnoringRequestToBeDelegate: false,
  isSendingRequestToBeDelegate: false,
  isCancelingSentRequestToBeDelegate: false,
  isAcceptingReceivedRequestToBeDelegate: false,
  isTerminatingRelationshipWithDelegate: false,
  isTerminatingRelationshipWithDelegator: false,
  outstandingRewards: BigNumber.from(0),
};

export const DelegationContext = createContext<DelegationContextState>(
  defaultDelegationContextState
);

export function DelegationProvider({ children }: { children: ReactNode }) {
  const [outstandingRewards, setOutstandingRewards] = useState(
    BigNumber.from(0)
  );
  const { address } = useAccountDetails();
  const {
    data: receivedRequestsToBeDelegate,
    isLoading: receivedRequestsToBeDelegateLoading,
  } = useReceivedRequestsToBeDelegate(address);
  const {
    data: sentRequestsToBeDelegate,
    isLoading: sentRequestsToBeDelegateLoading,
  } = useSentRequestsToBeDelegate(address);
  const {
    data: delegatorSetEventsForDelegate,
    isLoading: delegatorSetEventsForDelegateLoading,
  } = useDelegatorSetEventsForDelegate(address);
  const {
    data: delegatorSetEventsForDelegator,
    isLoading: delegatorSetEventsForDelegatorLoading,
  } = useDelegatorSetEventsForDelegator(address);
  const { data: voterFromDelegate, isLoading: voterFromDelegateLoading } =
    useVoterFromDelegate(address);
  const { data: delegateToStaker, isLoading: delegateToStakerLoading } =
    useDelegateToStaker(address);
  const {
    data: ignoredRequestToBeDelegateAddresses,
    isLoading: ignoredRequestToBeDelegateAddressesLoading,
  } = useIgnoredRequestToBeDelegateAddresses(address);
  const {
    ignoreReceivedRequestToBeDelegateMutation,
    isIgnoringRequestToBeDelegate,
  } = useIgnoreReceivedRequestToBeDelegate(address);
  const { sendRequestToBeDelegateMutation, isSendingRequestToBeDelegate } =
    useSendRequestToBeDelegate({ address });
  const {
    cancelSentRequestToBeDelegateMutation,
    isCancelingSentRequestToBeDelegate,
  } = useCancelSentRequestToBeDelegate(address);
  const {
    acceptReceivedRequestToBeDelegateMutation,
    isAcceptingReceivedRequestToBeDelegate,
  } = useAcceptReceivedRequestToBeDelegate(address);
  const {
    terminateRelationshipWithDelegateMutation,
    isTerminatingRelationshipWithDelegate,
  } = useTerminateRelationshipWithDelegate(address);
  const {
    terminateRelationshipWithDelegatorMutation,
    isTerminatingRelationshipWithDelegator,
  } = useTerminateRelationshipWithDelegator(address);
  const { data: stakerDetails } = useStakerDetails(address);
  const { delegate } = stakerDetails ?? {};
  const { votingWriter } = useContractsContext();
  const { closePanel } = usePanelContext();
  const pendingReceivedRequestsToBeDelegate =
    getPendingReceivedRequestsToBeDelegate();
  const hasPendingReceivedRequestsToBeDelegate =
    pendingReceivedRequestsToBeDelegate.length > 0;
  const pendingSentRequestsToBeDelegate = getPendingSentRequestsToBeDelegate();
  const hasPendingSentRequestsToBeDelegate =
    getHasPendingSentRequestsToBeDelegate();
  const delegationStatus = getDelegationStatus();
  const isNoWalletConnected = delegationStatus === "no-wallet-connected";
  const isNoDelegation = delegationStatus === "no-delegation";
  const isDelegatePending = delegationStatus === "delegate-pending";
  const isDelegatorPending = delegationStatus === "delegator-pending";
  const isDelegate = delegationStatus === "delegate";
  const isDelegator = delegationStatus === "delegator";
  const delegatorAddress = isDelegate ? getDelegatorAddress() : undefined;
  const delegateAddress = getDelegateAddress();
  const stakerAddress = delegatorAddress ?? address;
  // this makes sure to look up staker details by delegator if you are delegatee
  const { data: stakerAddressStakerDetails } = useStakerDetails(stakerAddress);
  const { data: stakerAddressStakedBalance } = useStakedBalance(stakerAddress);
  const isLoading =
    receivedRequestsToBeDelegateLoading ||
    sentRequestsToBeDelegateLoading ||
    delegatorSetEventsForDelegateLoading ||
    voterFromDelegateLoading ||
    delegateToStakerLoading ||
    delegatorSetEventsForDelegatorLoading ||
    ignoredRequestToBeDelegateAddressesLoading;
  const isMutating =
    isIgnoringRequestToBeDelegate ||
    isSendingRequestToBeDelegate ||
    isCancelingSentRequestToBeDelegate ||
    isAcceptingReceivedRequestToBeDelegate ||
    isTerminatingRelationshipWithDelegate ||
    isTerminatingRelationshipWithDelegator;
  const isBusy = isLoading || isMutating;

  function getDelegateAddress() {
    if (isDelegator) return delegate;
    if (isDelegate) return address;
    return zeroAddress;
  }

  function getDelegatorAddress() {
    if (isDelegator) return address;
    if (isDelegate) return voterFromDelegate;
    return zeroAddress;
  }

  function getDelegationStatus(): DelegationStatusT {
    if (!address) return "no-wallet-connected";
    // if you have neither `DelegatorSet` nor `DelegateSet` events, you are neither a delegate or a delegator
    if (
      !getHasReceivedRequestsToBeDelegate() &&
      !getHasSentRequestsToBeDelegate() &&
      !getHasDelegatorSetEvents()
    )
      return "no-delegation";
    // if there is a delegator set for your address, you are a delegate
    if (
      voterFromDelegate &&
      getAddress(voterFromDelegate) !== getAddress(address)
    )
      return "delegate";
    // if the `delegateToStaker` mapping for the `delegate` defined in your `voterStakes`, then you are a delegator
    if (
      delegateToStaker &&
      getAddress(address) === getAddress(delegateToStaker)
    )
      return "delegator";
    // if the user has received a request to be another wallet's delegate but they have not accepted any, then they are a pending delegate
    if (hasPendingReceivedRequestsToBeDelegate) return "delegate-pending";
    // if the user has sent a request to be another wallet's delegate but the other wallet has not yet accepted, then they are a pending delegator
    if (getHasPendingSentRequestsToBeDelegate()) return "delegator-pending";
    // if none are true we assume the user has no delegation
    return "no-delegation";
  }

  function getHasSentRequestsToBeDelegate() {
    return sentRequestsToBeDelegate && sentRequestsToBeDelegate.length > 0;
  }

  function getHasReceivedRequestsToBeDelegate() {
    return (
      receivedRequestsToBeDelegate && receivedRequestsToBeDelegate.length > 0
    );
  }

  function getHasDelegatorSetEvents() {
    return (
      delegatorSetEventsForDelegate && delegatorSetEventsForDelegate.length > 0
    );
  }

  function getHasPendingSentRequestsToBeDelegate() {
    const pendingSentRequestsToBeDelegate =
      getPendingSentRequestsToBeDelegate();
    const mostRecentSentRequestToBeDelegate =
      pendingSentRequestsToBeDelegate.at(-1);
    return (
      mostRecentSentRequestToBeDelegate?.delegate !== zeroAddress &&
      pendingSentRequestsToBeDelegate.length > 0
    );
  }

  function getPendingReceivedRequestsToBeDelegate() {
    return (
      receivedRequestsToBeDelegate
        ?.filter(
          (delegateSet) =>
            !delegatorSetEventsForDelegate?.some(
              (delegatorSet) =>
                delegatorSet.delegate === delegateSet.delegate &&
                delegatorSet.delegator === delegatorSet.delegator
            )
        )
        ?.filter(
          ({ delegator }) =>
            !ignoredRequestToBeDelegateAddresses?.includes(delegator)
        ) ?? []
    );
  }

  function getPendingSentRequestsToBeDelegate() {
    if (delegate === zeroAddress) return [];

    return (
      sentRequestsToBeDelegate?.filter(
        (delegateSet) =>
          !delegatorSetEventsForDelegator?.some(
            (delegatorSet) =>
              delegatorSet.delegate === delegateSet.delegate &&
              delegatorSet.delegator === delegatorSet.delegator
          )
      ) ?? []
    );
  }

  const sendRequestToBeDelegate = useCallback(
    function sendRequestToBeDelegate(delegateAddress: string) {
      if (!votingWriter) return;
      sendRequestToBeDelegateMutation(
        {
          voting: votingWriter,
          delegateAddress,
          notificationMessages: {
            pending: `Requesting ${truncateEthAddress(
              delegateAddress
            )} to be your delegate...`,
            success: `Successfully requested ${truncateEthAddress(
              delegateAddress
            )} to be your delegate`,
            error: `Failed to request ${truncateEthAddress(
              delegateAddress
            )} to be your delegate`,
          },
        },
        {
          onSuccess: () => {
            closePanel();
          },
        }
      );
    },
    [closePanel, sendRequestToBeDelegateMutation, votingWriter]
  );

  const cancelSentRequestToBeDelegate = useCallback(
    function cancelSentRequestToBeDelegate() {
      if (!votingWriter) return;
      cancelSentRequestToBeDelegateMutation({
        voting: votingWriter,
        notificationMessages: {
          pending: "Cancelling request to delegate...",
          success: "Successfully cancelled request to delegate",
          error: "Failed to cancel request to delegate",
        },
      });
    },
    [cancelSentRequestToBeDelegateMutation, votingWriter]
  );

  const acceptReceivedRequestToBeDelegate = useCallback(
    function acceptReceivedRequestToBeDelegate(delegatorAddress: string) {
      if (!votingWriter) return;
      acceptReceivedRequestToBeDelegateMutation({
        voting: votingWriter,
        delegatorAddress,
        notificationMessages: {
          pending: `Accepting request to be delegate from ${truncateEthAddress(
            delegatorAddress
          )}...`,
          success: `Successfully accepted request to be delegate from ${truncateEthAddress(
            delegatorAddress
          )}`,
          error: `Failed to accept request to be delegate from ${truncateEthAddress(
            delegatorAddress
          )}`,
        },
      });
    },
    [acceptReceivedRequestToBeDelegateMutation, votingWriter]
  );

  const ignoreReceivedRequestToBeDelegate = useCallback(
    function (delegatorAddress: string) {
      if (!address) return;

      ignoreReceivedRequestToBeDelegateMutation({
        userAddress: address,
        delegatorAddress,
      });
    },
    [address, ignoreReceivedRequestToBeDelegateMutation]
  );

  const terminateRelationshipWithDelegator = useCallback(() => {
    if (!votingWriter) return;
    terminateRelationshipWithDelegatorMutation({
      voting: votingWriter,
      notificationMessages: {
        pending: "Removing delegator...",
        success: "Successfully removed delegator",
        error: "Failed to remove delegator",
      },
    });
  }, [terminateRelationshipWithDelegatorMutation, votingWriter]);

  const terminateRelationshipWithDelegate = useCallback(() => {
    if (!votingWriter) return;
    terminateRelationshipWithDelegateMutation({
      voting: votingWriter,
      notificationMessages: {
        pending: "Removing delegate...",
        success: "Successfully removed delegate",
        error: "Failed to remove delegate",
      },
    });
  }, [terminateRelationshipWithDelegateMutation, votingWriter]);

  const { data: rewardCalculationInputs } = useRewardsCalculationInputs();

  useInterval(() => {
    updateOutstandingRewards();
  }, 1000);

  function updateOutstandingRewards() {
    if (isNoWalletConnected || isNoDelegation) {
      setOutstandingRewards(BigNumber.from(0));
    }
    if (rewardCalculationInputs === undefined) return;
    if (stakerAddressStakerDetails === undefined) return;
    if (stakerAddressStakedBalance === undefined) return;
    const { emissionRate, rewardPerTokenStored, cumulativeStake, updateTime } =
      rewardCalculationInputs;
    const { outstandingRewards: voterOutstandingRewards, rewardsPaidPerToken } =
      stakerAddressStakerDetails;
    if (voterOutstandingRewards === undefined) return;
    const calculatedOutstandingRewards = calculateOutstandingRewards({
      voterOutstandingRewards,
      stakedBalance: stakerAddressStakedBalance,
      rewardsPaidPerToken,
      cumulativeStake,
      rewardPerTokenStored,
      updateTime,
      emissionRate,
    });
    setOutstandingRewards(calculatedOutstandingRewards);
  }

  const value = useMemo(
    () => ({
      delegationStatus,
      isNoWalletConnected,
      isNoDelegation,
      isDelegatePending,
      isDelegatorPending,
      isDelegate,
      isDelegator,
      delegatorAddress,
      delegateAddress,
      pendingReceivedRequestsToBeDelegate,
      pendingSentRequestsToBeDelegate,
      hasPendingSentRequestsToBeDelegate,
      hasPendingReceivedRequestsToBeDelegate,
      sendRequestToBeDelegate,
      terminateRelationshipWithDelegate,
      terminateRelationshipWithDelegator,
      acceptReceivedRequestToBeDelegate,
      ignoreReceivedRequestToBeDelegate,
      cancelSentRequestToBeDelegate,
      isLoading,
      isMutating,
      isBusy,
      receivedRequestsToBeDelegateLoading,
      sentRequestsToBeDelegateLoading,
      delegatorSetEventsForDelegateLoading,
      voterFromDelegateLoading,
      delegateToStakerLoading,
      delegatorSetEventsForDelegatorLoading,
      ignoredRequestToBeDelegateAddressesLoading,
      isIgnoringRequestToBeDelegate,
      isSendingRequestToBeDelegate,
      isCancelingSentRequestToBeDelegate,
      isAcceptingReceivedRequestToBeDelegate,
      isTerminatingRelationshipWithDelegate,
      isTerminatingRelationshipWithDelegator,
      outstandingRewards,
    }),
    [
      acceptReceivedRequestToBeDelegate,
      cancelSentRequestToBeDelegate,
      delegateAddress,
      delegateToStakerLoading,
      delegationStatus,
      delegatorAddress,
      delegatorSetEventsForDelegateLoading,
      delegatorSetEventsForDelegatorLoading,
      hasPendingReceivedRequestsToBeDelegate,
      hasPendingSentRequestsToBeDelegate,
      ignoreReceivedRequestToBeDelegate,
      ignoredRequestToBeDelegateAddressesLoading,
      isAcceptingReceivedRequestToBeDelegate,
      isBusy,
      isCancelingSentRequestToBeDelegate,
      isDelegate,
      isDelegatePending,
      isDelegator,
      isDelegatorPending,
      isIgnoringRequestToBeDelegate,
      isLoading,
      isMutating,
      isNoDelegation,
      isNoWalletConnected,
      isSendingRequestToBeDelegate,
      isTerminatingRelationshipWithDelegate,
      isTerminatingRelationshipWithDelegator,
      pendingReceivedRequestsToBeDelegate,
      pendingSentRequestsToBeDelegate,
      receivedRequestsToBeDelegateLoading,
      sendRequestToBeDelegate,
      sentRequestsToBeDelegateLoading,
      terminateRelationshipWithDelegate,
      terminateRelationshipWithDelegator,
      voterFromDelegateLoading,
      outstandingRewards,
    ]
  );
  return (
    <DelegationContext.Provider value={value}>
      {children}
    </DelegationContext.Provider>
  );
}
