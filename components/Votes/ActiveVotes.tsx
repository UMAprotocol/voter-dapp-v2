import { useConnectWallet } from "@web3-onboard/react";
import {
  Button,
  IconWrapper,
  Pagination,
  Tooltip,
  Toggle,
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
  useRevealVotes,
  useStakedBalance,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import { useEffect, useState } from "react";
import { SelectedVotesByKeyT, VoteT } from "types";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  ButtonSpacer,
  HelperText,
  Divider,
  InfoText,
  TitleRow,
  ToggleLabel,
  StatusBanner,
  StatusCard,
  StatusGrid,
  BannerStack,
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
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const [dirtyInputs, setDirtyInput] = useState<boolean[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [hasCommitted, setHasCommitted] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const { showPagination, entriesToShow, ...paginationProps } = usePagination(
    activeVoteList ?? []
  );

  function isDirty(): boolean {
    return dirtyInputs.some((x) => x);
  }

  const selectedVotesCount = Object.values(selectedVotes).filter((x) => x).length;
  const totalVotes = activeVoteList.length;
  const committedCount = activeVoteList.filter((vote) => vote.isCommitted).length;
  const revealedCount = activeVoteList.filter((vote) => vote.isRevealed).length;

  useEffect(() => {
    setHasCommitted(false);
    setHasRevealed(false);
  }, [phase, totalVotes]);

  useEffect(() => {
    const hasUnsavedChanges = dirtyInputs.some((x) => x);
    if (hasUnsavedChanges) {
      setHasCommitted(false);
    }
  }, [selectedVotesCount, dirtyInputs]);

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
    // check if we have votes to commit by seeing there are more than 1 and its dirty
    const hasVotesToCommit =
      selectedVotesCount > 0
        ? hasPreviouslyCommittedAll
          ? isDirty()
          : true
        : false;
    const hasVotesToReveal = getVotesToReveal().length > 0;
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
      actionConfig.canCommit = true;
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
  }

  function revealVotes() {
    if (!actionStatus.canReveal || !votingWriter) return;

    revealVotesMutation({
      voting: votingWriter,
      votesToReveal: getVotesToReveal(),
    });
  }

  function getVotesToReveal() {
    return (
      activeVoteList?.filter(
        (vote) =>
          vote.isCommitted &&
          !!vote.decryptedVote &&
          vote.isRevealed === false &&
          vote.canReveal
      ) ?? []
    );
  }

  function selectVote(value: string | undefined, vote: VoteT) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function clearSelectedVote(vote: VoteT) {
    selectVote(undefined, vote);
  }

  const commitCompleted =
    hasCommitted || (phase === "commit" && totalVotes > 0 && committedCount === totalVotes);
  const revealCompleted =
    hasRevealed || (phase === "reveal" && totalVotes > 0 && revealedCount === totalVotes);
  const needsCommitWarning =
    phase === "commit" && totalVotes > 0 && committedCount < totalVotes && !commitCompleted;
  const needsRevealWarning =
    phase === "reveal" && totalVotes > 0 && revealedCount < totalVotes && !revealCompleted;
  const preparedPercent = totalVotes > 0 ? Math.round((selectedVotesCount / totalVotes) * 100) : 0;

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
  }));

  return (
    <PageSurface $darkMode={darkMode}>
      <TitleRow>
        <Title> Active votes </Title>
        <ToggleLabel>
          Dark mode
          <Toggle clicked={darkMode} onClick={() => setDarkMode((prev) => !prev)} />
        </ToggleLabel>
      </TitleRow>
      <StatusGrid>
        <StatusCard $darkMode={darkMode}>
          <h4>Active this cycle</h4>
          <strong>{totalVotes}</strong>
          <HelperText>All votes currently available to you.</HelperText>
        </StatusCard>
        <StatusCard $darkMode={darkMode}>
          <h4>Prepared to commit</h4>
          <strong>
            {selectedVotesCount}/{totalVotes || 0}
          </strong>
          <HelperText>
            {totalVotes > 0 ? `${preparedPercent}% of votes selected` : "No votes to commit yet."}
          </HelperText>
        </StatusCard>
        <StatusCard $darkMode={darkMode}>
          <h4>Committed</h4>
          <strong>
            {committedCount}/{totalVotes || 0}
          </strong>
          <HelperText>Votes locked in during this phase.</HelperText>
        </StatusCard>
        <StatusCard $darkMode={darkMode}>
          <h4>Revealed</h4>
          <strong>
            {revealedCount}/{totalVotes || 0}
          </strong>
          <HelperText>Votes successfully revealed.</HelperText>
        </StatusCard>
      </StatusGrid>
      <BannerStack>
        {commitCompleted && (
          <StatusBanner $type="success">You've committed your votes for this round.</StatusBanner>
        )}
        {revealCompleted && (
          <StatusBanner $type="success">Great! Your reveals are confirmed for this cycle.</StatusBanner>
        )}
        {needsCommitWarning && (
          <StatusBanner $type="danger">
            You still need to commit {totalVotes - committedCount} of {totalVotes} votes.
          </StatusBanner>
        )}
        {needsRevealWarning && (
          <StatusBanner $type="danger">
            You still need to reveal {totalVotes - revealedCount} of {totalVotes} votes.
          </StatusBanner>
        )}
      </BannerStack>
      <VoteTimeline />
      <VotesTableWrapper>
        <VoteList
          activityStatus="active"
          data={data}
          variant="grid"
          darkMode={darkMode}
        />
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
    </PageSurface>
  );
}
