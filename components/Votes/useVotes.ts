import { useConnectWallet } from "@web3-onboard/react";
import { defaultResultsPerPage } from "constant";
import { formatVotesToCommit } from "helpers";
import { config } from "helpers/config";
import {
  useCommitVotes,
  useContractsContext,
  useDelegationContext,
  usePanelContext,
  useRevealVotes,
  useStakingContext,
  useUserContext,
  useVoteTimingContext,
  useVotesContext,
  useWalletContext,
} from "hooks";
import { useCallback, useEffect, useState } from "react";
import {
  ActionStatus,
  ActivityStatusT,
  SelectedVotesByKeyT,
  UniqueIdT,
  VoteT,
} from "types";

export function useVotes(activityStatus: ActivityStatusT) {
  const {
    activeVotesList,
    upcomingVotesList,
    pastVotesList,
    getUserDependentIsFetching,
  } = useVotesContext();
  const votesListsForStatus = {
    active: activeVotesList,
    upcoming: upcomingVotesList,
    past: pastVotesList,
  };
  const votesList = votesListsForStatus[activityStatus];
  const [votesToShow, setVotesToShow] = useState(votesList);
  const { phase, roundId } = useVoteTimingContext();
  const { address, hasSigningKey, correctChainConnected, signingKey } =
    useUserContext();
  const { signer, sign, isSigning, setCorrectChain, isSettingChain } =
    useWalletContext();
  const { votingWriter } = useContractsContext();
  const { stakedBalance } = useStakingContext();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const { openPanel } = usePanelContext();
  const [{ connecting: isConnectingWallet }, connect] = useConnectWallet();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes();
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const [dirtyInputs, setDirtyInputs] = useState<Record<UniqueIdT, boolean>>(
    {}
  );

  const delegationStatus = getDelegationStatus();
  const isDelegate = delegationStatus === "delegate";
  const isDelegator = delegationStatus === "delegator";
  const delegatorAddress = isDelegate ? getDelegatorAddress() : undefined;
  const isCommit = phase === "commit";
  const isReveal = phase === "reveal";
  const hasStaked = stakedBalance?.gt(0) ?? false;
  const hasSigner = !!signer;
  const votesToReveal = activeVotesList.filter(
    (vote) =>
      vote.isCommitted &&
      !!vote.decryptedVote &&
      vote.isRevealed === false &&
      vote.canReveal
  );
  const isFetching =
    getUserDependentIsFetching() || isCommittingVotes || isRevealingVotes;

  const isAnyDirty = Object.values(dirtyInputs).some(Boolean);
  const hasPreviouslyCommittedAll =
    activeVotesList.filter((vote) => vote.decryptedVote).length ===
    activeVotesList.length;
  // counting how many votes we have edited with committable values ( non empty )
  const selectedVotesCount = Object.values(selectedVotes).filter(
    (x) => x
  ).length;
  // check if we have votes to commit by seeing there are more than 1 and its dirty
  const hasVotesToCommit =
    selectedVotesCount > 0
      ? hasPreviouslyCommittedAll
        ? isAnyDirty
        : true
      : false;
  const hasVotesToReveal = votesToReveal.length > 0;
  // the current account is editing a previously committed value from another account, either delegate or delegator
  const isEditingUnknownVote =
    activeVotesList.filter((vote) => {
      return (
        vote.commitHash && !vote.decryptedVote && selectedVotes[vote.uniqueKey]
      );
    }).length > 0;
  const requiredForBothCommitAndReveal =
    !!address &&
    !!signingKey &&
    !!votingWriter &&
    correctChainConnected &&
    hasSigner &&
    hasStaked &&
    !isSigning &&
    !isSettingChain &&
    !isConnectingWallet &&
    !isCommittingVotes &&
    !isRevealingVotes;
  const canCommit =
    requiredForBothCommitAndReveal && isCommit && hasVotesToCommit;
  const canReveal =
    requiredForBothCommitAndReveal && isReveal && hasVotesToReveal;

  const commitVotes = useCallback(
    async function commitVotes() {
      if (!canCommit) return;

      const formattedVotes = await formatVotesToCommit({
        votes: activeVotesList,
        selectedVotes,
        roundId,
        address: delegatorAddress ? delegatorAddress : address,
        signingKey,
      });
      commitVotesMutation(
        {
          voting: votingWriter,
          formattedVotes,
        },
        {
          onSuccess: () => {
            setSelectedVotes({});
          },
        }
      );
    },
    [
      activeVotesList,
      address,
      canCommit,
      commitVotesMutation,
      delegatorAddress,
      roundId,
      selectedVotes,
      signingKey,
      votingWriter,
    ]
  );

  const revealVotes = useCallback(
    function revealVotes() {
      if (!canReveal) return;

      revealVotesMutation({
        voting: votingWriter,
        votesToReveal,
      });
    },
    [canReveal, revealVotesMutation, votesToReveal, votingWriter]
  );

  const calculateActionStatus = useCallback(
    function calculateActionStatus() {
      const actionConfig: ActionStatus = {
        hidden: true,
        tooltip: undefined,
        label: "",
        infoText: undefined,
        onClick: () => undefined,
        disabled: true,
      };

      if (!hasSigner || !address) {
        actionConfig.hidden = false;
        actionConfig.disabled = false;
        actionConfig.label = "Connect Wallet";
        actionConfig.onClick = () => {
          connect().catch(console.error);
        };

        if (isConnectingWallet) {
          actionConfig.disabled = true;
        }
        return actionConfig;
      }
      if (!correctChainConnected) {
        actionConfig.hidden = false;
        actionConfig.disabled = false;
        actionConfig.label = `Switch To ${config.properName}`;
        actionConfig.onClick = () => setCorrectChain();

        if (isSettingChain) {
          actionConfig.disabled = true;
        }
        return actionConfig;
      }

      if (isCommit) {
        actionConfig.label = "Commit";
        actionConfig.hidden = false;
        if (isEditingUnknownVote && (isDelegate || isDelegator)) {
          const otherAccount = isDelegate ? "delegator" : "delegate";
          actionConfig.infoText = {
            label: `Editing ${otherAccount}'s vote.`,
            tooltip: `Your ${otherAccount} has already committed a vote for you, there is no need to re-vote on this account. Only do this if you want to change the vote or change which account can reveal, otherwise you will waste gas.`,
          };
        }
        if (isCommittingVotes) {
          actionConfig.disabled = true;
          actionConfig.tooltip = "Committing votes in progress...";
          return actionConfig;
        }
        if (isDelegate) {
          if (!hasStaked) {
            actionConfig.disabled = true;
            actionConfig.tooltip =
              "You cannot commit because your delegator has no UMA Staked.";
            return actionConfig;
          }
        } else {
          if (!hasStaked) {
            actionConfig.disabled = true;
            actionConfig.tooltip =
              "You cannot commit because you have no UMA Staked.";
            return actionConfig;
          }
        }
        if (!hasSigningKey) {
          actionConfig.label = "Sign";
          actionConfig.onClick = () => sign();
          actionConfig.infoText = {
            label: "Why do I need to sign?",
            tooltip:
              "UMA uses this signature to verify that you are the owner of this address. We must do this to prevent double voting.",
          };
          actionConfig.disabled = false;

          if (isSigning) {
            actionConfig.disabled = true;
            actionConfig.tooltip =
              "Confirm the request for a signature in your wallet software.";
            return actionConfig;
          }
          return actionConfig;
        }
        if (!hasVotesToCommit) {
          actionConfig.disabled = true;
          actionConfig.tooltip =
            "You must enter your votes before you can continue.";
          return actionConfig;
        }
        actionConfig.disabled = false;
        actionConfig.onClick = () => {
          commitVotes().catch(console.error);
        };
        return actionConfig;
      }
      if (isReveal) {
        actionConfig.hidden = false;
        actionConfig.label = "Reveal";
        if (!hasSigningKey) {
          actionConfig.label = "Sign";
          actionConfig.onClick = () => sign();
          actionConfig.infoText = {
            label: "Why do I need to sign?",
            tooltip:
              "UMA uses this signature to verify that you are the owner of this address. We must do this to prevent double voting.",
          };
          actionConfig.disabled = false;
          if (isSigning) {
            actionConfig.disabled = true;
            actionConfig.tooltip =
              "Confirm the request for a signature in your wallet software.";
            return actionConfig;
          }
          return actionConfig;
        }
        if (isRevealingVotes) {
          actionConfig.disabled = true;
          actionConfig.tooltip = "Revealing votes in progress...";
          return actionConfig;
        }
        if (!hasVotesToReveal) {
          actionConfig.disabled = true;
          actionConfig.tooltip = "You have no votes to reveal.";
          return actionConfig;
        }
        actionConfig.disabled = false;
        actionConfig.onClick = () => revealVotes();
        return actionConfig;
      }
      return actionConfig;
    },
    [
      address,
      commitVotes,
      connect,
      correctChainConnected,
      hasSigner,
      hasSigningKey,
      hasStaked,
      hasVotesToCommit,
      hasVotesToReveal,
      isCommit,
      isCommittingVotes,
      isConnectingWallet,
      isDelegate,
      isDelegator,
      isEditingUnknownVote,
      isReveal,
      isRevealingVotes,
      isSettingChain,
      isSigning,
      revealVotes,
      setCorrectChain,
      sign,
    ]
  );

  useEffect(() => {
    if (activeVotesList.length <= defaultResultsPerPage) {
      setVotesToShow(activeVotesList);
    }
  }, [activeVotesList]);

  const isDirty = useCallback(
    function isDirty(uniqueKey: UniqueIdT) {
      return dirtyInputs[uniqueKey];
    },
    [dirtyInputs]
  );

  const selectVote = useCallback(function selectVote(
    value: string | undefined,
    vote: VoteT
  ) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  },
  []);

  const clearSelectedVote = useCallback(function clearSelectedVote(
    vote: VoteT
  ) {
    setSelectedVotes((selected) => ({
      ...selected,
      [vote.uniqueKey]: undefined,
    }));
  },
  []);

  const resetSelectedVotes = useCallback(function resetSelectedVotes() {
    setSelectedVotes({});
  }, []);

  const moreDetailsAction = useCallback(
    function moreDetailsAction(vote: VoteT) {
      openPanel("vote", vote);
    },
    [openPanel]
  );

  const setDirty = useCallback(function setDirty(
    dirty: boolean,
    uniqueKey: UniqueIdT
  ) {
    setDirtyInputs((inputs) => ({
      ...inputs,
      [uniqueKey]: dirty,
    }));
  },
  []);

  return {
    phase,
    delegationStatus,
    votesList,
    votesToShow,
    setVotesToShow,
    selectedVotes,
    selectVote,
    resetSelectedVotes,
    clearSelectedVote,
    moreDetailsAction,
    isDirty,
    isAnyDirty,
    setDirty,
    isFetching,
    activityStatus,
    actionStatus: calculateActionStatus(),
  };
}
