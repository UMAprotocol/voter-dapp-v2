import { useConnectWallet } from "@web3-onboard/react";
import {
  Button,
  IconWrapper,
  Pagination,
  Tooltip,
  usePagination,
  VoteList,
  VoteTimeline,
} from "components";
import { formatVotesToCommit } from "helpers";
import { config } from "helpers/config";
import {
  useAccountDetails,
  useCommitVotes,
  useContractsContext,
  useDelegationContext,
  usePanelContext,
  usePersistedVotes,
  useRevealVotes,
  useStakedBalance,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { useState, useEffect, useMemo } from "react";
import { VoteT } from "types";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  ButtonSpacer,
  Divider,
  InfoText,
  PaginationWrapper,
  RecommittingVotesMessage,
  Title,
  VotesTableWrapper,
  WarningIcon,
} from "./style";

export function ActiveVotes() {
  const { activeVoteList } = useVotesContext();
  const { phase, roundId } = useVoteTimingContext();
  const { address } = useAccountDetails();
  const {
    signingKeys,
    signer,
    sign,
    isSigning,
    isWrongChain,
    setCorrectChain,
    isSettingChain,
  } = useWalletContext();
  const signingKey = address ? signingKeys[address] : undefined;
  const hasSigningKey = !!signingKey;
  const { votingWriter } = useContractsContext();
  const { isDelegate, isDelegator, delegatorAddress } = useDelegationContext();
  const { data: stakedBalance } = useStakedBalance(
    isDelegate ? delegatorAddress : address
  );
  const { openPanel } = usePanelContext();
  const [{ connecting: isConnectingWallet }, connect] = useConnectWallet();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes(address);
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes(address);
  const [selectedVotes, setSelectedVotes] = usePersistedVotes(roundId);
  const [dirtyInputs, setDirtyInput] = useState<boolean[]>([]);
  const [selectedRevealVotes, setSelectedRevealVotes] = useState<
    Record<string, boolean>
  >({});
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    activeVoteList ?? []
  );

  function isDirty(): boolean {
    return dirtyInputs.some((x) => x);
  }

  // Get all votes that are eligible for reveal
  const revealableVotes = useMemo(() => {
    return (
      activeVoteList?.filter(
        (vote) =>
          vote.isCommitted &&
          !!vote.decryptedVote &&
          vote.isRevealed === false &&
          vote.canReveal
      ) ?? []
    );
  }, [activeVoteList]);

  // Initialize selected reveal votes when entering reveal phase
  useEffect(() => {
    if (phase === "reveal" && revealableVotes.length > 0) {
      setSelectedRevealVotes((prev) => {
        const updated = { ...prev };
        // Add any new revealable votes that aren't in the selection yet
        revealableVotes.forEach((vote) => {
          if (updated[vote.uniqueKey] === undefined) {
            updated[vote.uniqueKey] = true; // Select all by default
          }
        });
        // Remove votes that are no longer revealable
        Object.keys(updated).forEach((key) => {
          if (!revealableVotes.find((v) => v.uniqueKey === key)) {
            delete updated[key];
          }
        });
        return updated;
      });
    }
  }, [phase, revealableVotes]);

  function toggleRevealVoteSelection(uniqueKey: string) {
    setSelectedRevealVotes((prev) => ({
      ...prev,
      [uniqueKey]: !(prev[uniqueKey] ?? true), // Toggle from default true
    }));
  }

  function isVoteSelectedForReveal(uniqueKey: string): boolean {
    return selectedRevealVotes[uniqueKey] ?? true; // Default to checked
  }

  function canVoteBeRevealed(vote: VoteT): boolean {
    return (
      vote.isCommitted === true &&
      !!vote.decryptedVote &&
      vote.isRevealed === false &&
      vote.canReveal === true
    );
  }

  const selectedRevealCount = revealableVotes.filter(
    (vote) => selectedRevealVotes[vote.uniqueKey] ?? true
  ).length;

  const actionStatus = calculateActionStatus();
  type ActionStatus = {
    tooltip?: string;
    label: string;
    infoText?: { label: string; tooltip: string };
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
    canCommit: boolean;
    canReveal: boolean;
  };
  function calculateActionStatus(): ActionStatus {
    const actionConfig: ActionStatus = {
      hidden: true,
      tooltip: undefined,
      label: "",
      infoText: undefined,
      onClick: () => undefined,
      disabled: true,
      canCommit: false,
      canReveal: false,
    };

    const isCommit = phase === "commit";
    const isReveal = phase === "reveal";
    const hasStaked = stakedBalance?.gt(0) ?? false;
    const hasSigner = !!signer;

    const hasPreviouslyCommittedAll =
      !!activeVoteList &&
      activeVoteList.filter((vote) => vote.decryptedVote).length ===
        activeVoteList.length;
    // counting how many votes we have edited with committable values ( non empty )
    const selectedVotesCount = Object.values(selectedVotes).filter(
      (x) => x
    ).length;
    // check if we have votes to commit by seeing there are more than 1 and its dirty
    const hasVotesToCommit =
      selectedVotesCount > 0
        ? hasPreviouslyCommittedAll
          ? isDirty()
          : true
        : false;
    const hasVotesToReveal = selectedRevealCount > 0;
    // the current account is editing a previously committed value from another account, either delegate or delegator
    const isEditingUnknownVote = Boolean(
      activeVoteList?.filter((vote) => {
        return (
          vote.commitHash &&
          !vote.decryptedVote &&
          selectedVotes[vote.uniqueKey]
        );
      }).length
    );

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
    if (isWrongChain) {
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
      actionConfig.label = `Commit ${selectedVotesCount}/${
        activeVoteList?.length ?? 0
      } votes`;
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
      actionConfig.canCommit = true;
      actionConfig.disabled = false;
      actionConfig.onClick = () => {
        commitVotes().catch(console.error);
      };
      return actionConfig;
    }
    if (isReveal) {
      actionConfig.hidden = false;
      actionConfig.label = `Reveal ${selectedRevealCount}/${revealableVotes.length} votes`;
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
      actionConfig.canReveal = true;
      actionConfig.disabled = false;
      actionConfig.onClick = () => revealVotes();
      return actionConfig;
    }
    return actionConfig;
  }

  async function commitVotes() {
    if (
      !address ||
      !activeVoteList ||
      !actionStatus.canCommit ||
      !signingKey ||
      !votingWriter
    )
      return;

    const formattedVotes = await formatVotesToCommit({
      votes: activeVoteList,
      selectedVotes,
      roundId,
      address: delegatorAddress ? delegatorAddress : address,
      signingKey,
    });
    commitVotesMutation({
      voting: votingWriter,
      formattedVotes,
    });
  }

  function revealVotes() {
    if (!actionStatus.canReveal || !votingWriter) return;

    revealVotesMutation({
      voting: votingWriter,
      votesToReveal: getVotesToReveal(),
    });
  }

  function getVotesToReveal() {
    return revealableVotes.filter(
      (vote) => selectedRevealVotes[vote.uniqueKey] ?? true
    );
  }

  function selectVote(value: string | undefined, vote: VoteT) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function clearSelectedVote(vote: VoteT) {
    selectVote(undefined, vote);
  }

  const data = entriesToShow?.map((vote, index) => ({
    phase: phase,
    vote: vote,
    selectedVote: selectedVotes[vote.uniqueKey],
    selectVote: (value: string | undefined) => selectVote(value, vote),
    clearVote: () => clearSelectedVote(vote),
    activityStatus: "active" as const,
    moreDetailsAction: () => openPanel("vote", vote),
    key: vote.uniqueKey,
    isDirty: dirtyInputs[index],
    setDirty: (dirty: boolean) =>
      setDirtyInput((inputs) => {
        inputs[index] = dirty;
        return [...inputs];
      }),
    // Reveal phase selection props
    isSelectedForReveal: isVoteSelectedForReveal(vote.uniqueKey),
    toggleRevealSelection: () => toggleRevealVoteSelection(vote.uniqueKey),
    canBeRevealed: canVoteBeRevealed(vote),
  }));

  return (
    <>
      <Title> Active votes: </Title>
      <VoteTimeline />
      <VotesTableWrapper>
        <VoteList activityStatus="active" data={data} />
      </VotesTableWrapper>
      {showPagination && (
        <PaginationWrapper>
          <Pagination {...paginationProps} />
        </PaginationWrapper>
      )}
      {isDirty() ? (
        <RecommittingVotesMessage>
          * Changes to committed votes need to be re-committed
        </RecommittingVotesMessage>
      ) : null}
      <ButtonOuterWrapper>
        {actionStatus.infoText ? (
          <Tooltip label={actionStatus.infoText.tooltip}>
            <InfoText>
              <IconWrapper width={20} height={20}>
                <WarningIcon />
              </IconWrapper>
              {actionStatus.infoText.label}
            </InfoText>
          </Tooltip>
        ) : null}
        <ButtonInnerWrapper>
          {isDirty() ? (
            <>
              <Button
                variant="secondary"
                label="Reset Changes"
                onClick={() => setSelectedVotes({})}
              />
              <ButtonSpacer />
            </>
          ) : undefined}
          {!actionStatus.hidden ? (
            actionStatus.tooltip ? (
              <Tooltip label={actionStatus.tooltip}>
                <div>
                  <Button
                    variant="primary"
                    label={actionStatus.label}
                    onClick={actionStatus.onClick}
                    disabled={actionStatus.disabled}
                  />
                </div>
              </Tooltip>
            ) : (
              <Button
                variant="primary"
                label={actionStatus.label}
                onClick={actionStatus.onClick}
                disabled={actionStatus.disabled}
              />
            )
          ) : null}
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
      <Divider />
    </>
  );
}
