import { useConnectWallet } from "@web3-onboard/react";
import {
  Button,
  IconWrapper,
  Pagination,
  Tooltip,
  VotesList,
  VotesListItem,
  VotesTableHeadings,
  VoteTimeline,
} from "components";
import { defaultResultsPerPage } from "constant";
import { formatVotesToCommit, getEntriesForPage } from "helpers";
import { config } from "helpers/config";
import {
  useCommitVotes,
  useContractsContext,
  useDelegationContext,
  usePaginationContext,
  usePanelContext,
  useRevealVotes,
  useStakingContext,
  useUserContext,
  useVotesContext,
  useVoteTimingContext,
  useWalletContext,
} from "hooks";
import Warning from "public/assets/icons/warning.svg";
import { useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { SelectedVotesByKeyT, VoteT } from "types";

export function Votes() {
  const {
    getActiveVotes,
    getUpcomingVotes,
    getPastVotes,
    getActivityStatus,
    getUserDependentIsFetching,
  } = useVotesContext();
  const [{ connecting: isConnectingWallet }, connect] = useConnectWallet();
  const { phase, roundId } = useVoteTimingContext();
  const { address, hasSigningKey, correctChainConnected, signingKey } =
    useUserContext();
  const { sign, isSigning, setCorrectChain, isSettingChain } =
    useWalletContext();
  const { voting } = useContractsContext();
  const { stakedBalance } = useStakingContext();
  const { getDelegationStatus, getDelegatorAddress } = useDelegationContext();
  const { commitVotesMutation, isCommittingVotes } = useCommitVotes();
  const { revealVotesMutation, isRevealingVotes } = useRevealVotes();
  const { openPanel } = usePanelContext();
  const {
    pageStates: {
      activeVotesPage: { resultsPerPage, pageNumber },
    },
  } = usePaginationContext();
  const [selectedVotes, setSelectedVotes] = useState<SelectedVotesByKeyT>({});
  const [dirtyInputs, setDirtyInput] = useState<boolean[]>([]);
  const isDelegate = getDelegationStatus() === "delegate";
  const isDelegator = getDelegationStatus() === "delegator";
  const delegatorAddress = isDelegate ? getDelegatorAddress() : undefined;

  function isDirty(): boolean {
    return dirtyInputs.some((x) => x);
  }
  type ButtonConfig = {
    tooltip?: string;
    label: string;
    infoText?: { label: string; tooltip: string };
    onClick: () => void;
    disabled?: boolean;
    hidden?: boolean;
    canCommit?: boolean;
    canReveal?: boolean;
  };
  // this is a special button that should only show when there are no votes, and signed in with no signature.
  // any other time, signing should be available to user.
  const signButtonConfig = getSignButtonConfig();
  function getSignButtonConfig() {
    const signButton: ButtonConfig = {
      hidden: true,
      tooltip: undefined,
      label: "",
      infoText: undefined,
      onClick: () => undefined,
      disabled: true,
    };
    const hasWallet = !!address;
    const isShowingVotes =
      Object.values(getActiveVotes()).filter((x) => x).length > 0;

    if (
      hasWallet &&
      !isShowingVotes &&
      !hasSigningKey &&
      correctChainConnected
    ) {
      signButton.hidden = false;
      signButton.disabled = false;
      signButton.label = "Sign";
      signButton.onClick = () => sign();
      signButton.infoText = {
        label: "Why do I need to sign?",
        tooltip:
          "UMA uses this signature to verify that you are the owner of this address. This will allow you to participate in votes and see your past votes.",
      };
      signButton.disabled = false;

      if (isSigning) {
        signButton.disabled = true;
        signButton.tooltip =
          "Confirm the request for a signature in your wallet software.";
        return signButton;
      }
      return signButton;
    }
    return signButton;
  }
  const votesToShow = getEntriesForPage(
    pageNumber,
    resultsPerPage,
    determineVotesToShow()
  );
  const actionStatus = calculateActionStatus();
  function calculateActionStatus(): ButtonConfig {
    const actionConfig: ButtonConfig = {
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

    const votesToShow = determineVotesToShow();
    const hasPreviouslyCommittedAll =
      votesToShow.filter((vote) => vote.decryptedVote).length ===
      votesToShow.length;
    // counting how many votes we have edited with commitable values ( non empty )
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
    const hasVotesToReveal = getVotesToReveal().length > 0;
    // the current account is editing a previoulsy committed value from antoher account, either delegate or delegator
    const isEditingUnknownVote =
      votesToShow.filter((vote) => {
        return (
          vote.commitHash &&
          !vote.decryptedVote &&
          selectedVotes[vote.uniqueKey]
        );
      }).length > 0;

    if (!address) {
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
          tooltip: `Your ${otherAccount} has already commited a vote for you, there is no need to re-vote on this account. Only do this if you want to change the vote or change which account can reveal, otherwise you will waste gas.`,
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
    if (!actionStatus.canCommit || !signingKey) return;

    const formattedVotes = await formatVotesToCommit({
      votes: getActiveVotes(),
      selectedVotes,
      roundId,
      address: delegatorAddress ? delegatorAddress : address,
      signingKey,
    });
    commitVotesMutation(
      {
        voting,
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
    if (!actionStatus.canReveal) return;

    revealVotesMutation({
      voting,
      votesToReveal: getVotesToReveal(),
    });
  }

  function getVotesToReveal() {
    return getActiveVotes().filter(
      (vote) =>
        vote.isCommitted &&
        !!vote.decryptedVote &&
        vote.isRevealed === false &&
        vote.canReveal
    );
  }

  function selectVote(value: string, vote: VoteT) {
    setSelectedVotes((selected) => ({ ...selected, [vote.uniqueKey]: value }));
  }

  function openVotePanel(vote: VoteT) {
    openPanel("vote", vote);
  }

  function determineVotesToShow() {
    const status = getActivityStatus();
    switch (status) {
      case "active":
        return getActiveVotes();
      case "upcoming":
        return getUpcomingVotes();
      case "past":
        return getPastVotes();
    }
  }

  function determineTitle() {
    const status = getActivityStatus();
    switch (status) {
      case "active":
        return "Active votes:";
      case "upcoming":
        return "Upcoming votes:";
      default:
        return "Past votes:";
    }
  }
  function renderButton(config: ButtonConfig) {
    return (
      <ButtonOuterWrapper>
        {config.infoText ? (
          <Tooltip label={config.infoText.tooltip}>
            <InfoText>
              <IconWrapper width={20} height={20}>
                <WarningIcon />
              </IconWrapper>
              {config.infoText.label}
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
          {!config.hidden ? (
            config.tooltip ? (
              <Tooltip label={config.tooltip}>
                <div>
                  <Button
                    variant="primary"
                    label={config.label}
                    onClick={config.onClick}
                    disabled={config.disabled}
                  />
                </div>
              </Tooltip>
            ) : (
              <Button
                variant="primary"
                label={config.label}
                onClick={config.onClick}
                disabled={config.disabled}
              />
            )
          ) : null}
        </ButtonInnerWrapper>
      </ButtonOuterWrapper>
    );
  }
  return (
    <>
      {renderButton(signButtonConfig)}
      <Title>{determineTitle()}</Title>
      {(getActivityStatus() === "active" ||
        getActivityStatus() === "upcoming") && <VoteTimeline />}
      <VotesTableWrapper>
        <VotesList
          headings={<VotesTableHeadings activityStatus={getActivityStatus()} />}
          rows={votesToShow.map((vote, index) => (
            <VotesListItem
              vote={vote}
              phase={phase}
              selectedVote={selectedVotes[vote.uniqueKey]}
              selectVote={(value) => selectVote(value, vote)}
              activityStatus={getActivityStatus()}
              moreDetailsAction={() => openVotePanel(vote)}
              key={vote.uniqueKey}
              delegationStatus={getDelegationStatus()}
              isDirty={dirtyInputs[index]}
              setDirty={(dirty: boolean) => {
                setDirtyInput((inputs) => {
                  inputs[index] = dirty;
                  return [...inputs];
                });
              }}
              isFetching={
                getUserDependentIsFetching() ||
                isCommittingVotes ||
                isRevealingVotes
              }
            />
          ))}
        />
      </VotesTableWrapper>
      {isDirty() ? (
        <RecommittingVotesMessage>
          * Changes to committed votes need to be re-committed
        </RecommittingVotesMessage>
      ) : null}
      {getActivityStatus() === "active" ? renderButton(actionStatus) : null}
      {determineVotesToShow().length > defaultResultsPerPage && (
        <PaginationWrapper>
          <Pagination
            paginateFor="activeVotesPage"
            numberOfEntries={determineVotesToShow().length}
          />
        </PaginationWrapper>
      )}
      {getPastVotes().length > 0 && getActivityStatus() !== "past" && (
        <>
          <Divider />
          <Title>Recent past votes:</Title>
          <VotesTableWrapper
            style={
              {
                "--margin-top": "0px",
              } as CSSProperties
            }
          >
            <VotesList
              headings={<VotesTableHeadings activityStatus="past" />}
              rows={getPastVotes()
                .slice(0, 3)
                .map((vote) => (
                  <VotesListItem
                    vote={vote}
                    phase={phase}
                    selectedVote={undefined}
                    selectVote={() => null}
                    activityStatus="past"
                    moreDetailsAction={() => openPanel("vote", vote)}
                    key={vote.uniqueKey}
                    isFetching={getUserDependentIsFetching()}
                  />
                ))}
            />
          </VotesTableWrapper>
          <ButtonInnerWrapper>
            <Button label="See all" href="/past-votes" variant="primary" />
          </ButtonInnerWrapper>
        </>
      )}
    </>
  );
}

const VotesTableWrapper = styled.div`
  margin-top: var(--margin-top, 35px);
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const ButtonOuterWrapper = styled.div`
  margin-top: 30px;
`;

const ButtonInnerWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: 15px;

  button {
    text-transform: capitalize;
  }
`;

const InfoText = styled.p`
  display: flex;
  gap: 15px;
  width: fit-content;
  margin-left: auto;
  margin-bottom: 15px;
  font: var(--text-md);
`;

const WarningIcon = styled(Warning)`
  path {
    stroke: var(--black);
    fill: transparent;
  }
`;

const PaginationWrapper = styled.div`
  margin-block: 30px;
`;

const ButtonSpacer = styled.div`
  width: 10px;
`;

const Divider = styled.div`
  height: 1px;
  margin-top: 45px;
  margin-bottom: 45px;
  background: var(--black-opacity-25);
`;

const RecommittingVotesMessage = styled.p`
  width: fit-content;
  font: var(--text-sm);
  margin-left: auto;
  margin-top: 10px;
`;
