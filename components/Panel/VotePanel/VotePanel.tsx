import removeMarkdown from "remove-markdown";
import { useState } from "react";

import { Tabs } from "components";
import { config, decodeHexString, getClaimTitle } from "helpers";
import { getOptimisticGovernorTitle } from "helpers/voting/optimisticGovernor";
import {
  usePanelContext,
  useVoteDiscussion,
  useAssertionClaim,
  useAugmentedVoteData,
  useVoteTimingContext,
  useVotePanelKeyboard,
} from "hooks";
import { useOptimisticGovernorData } from "hooks/queries/votes/useOptimisticGovernorData";
import { VoteT } from "types";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Discussion } from "./Discussion";
import { Result } from "./Result";
import { VotePanelVoteInput } from "./VotePanelVoteInput";
import { DiscussionSummary } from "components";
import { usePolymarketBulletins } from "hooks";
import { mobileAndUnder } from "constant";
import styled from "styled-components";
import LeftChevron from "public/assets/icons/left-chevron.svg";
import RightChevron from "public/assets/icons/right-chevron.svg";

interface Props {
  content: VoteT;
}
export function VotePanel({ content }: Props) {
  const {
    identifier,
    time,
    title,
    decodedIdentifier,
    resolvedPriceRequestIndex,
    origin,
    participation,
    results,
    isGovernance,
    options,
    decodedAncillaryData,
    assertionId,
    assertionChildChainId,
    ancillaryDataL2,
  } = content;

  const {
    navigableVotes,
    currentVoteIndex,
    goToNextVote,
    goToPrevVote,
    selectVote,
    selectedVotes,
    panelOpen,
    panelType,
  } = usePanelContext();

  const { phase } = useVoteTimingContext();
  const isCommitPhase = phase === "commit";

  const hasNavigation = navigableVotes.length > 1;
  const canGoPrev = currentVoteIndex > 0;
  const canGoNext = currentVoteIndex < navigableVotes.length - 1;

  const showVoteInput = isCommitPhase && selectVote !== undefined;

  useVotePanelKeyboard({
    isActive: panelOpen && panelType === "vote",
    goToPrevVote,
    goToNextVote,
    canGoPrev,
    canGoNext,
    options: showVoteInput ? content.options : undefined,
    currentVote: content,
    selectVote: showVoteInput ? selectVote : undefined,
  });

  const [selectedTab, setSelectedTab] = useState<string | undefined>();

  const { isOptimisticGovernorVote, explanationText } =
    useOptimisticGovernorData(decodedAncillaryData);

  const bulletins = usePolymarketBulletins(ancillaryDataL2);

  const optimisticGovernorTitle = isOptimisticGovernorVote
    ? getOptimisticGovernorTitle(explanationText)
    : "";

  const voteOrigin = isOptimisticGovernorVote ? "OSnap" : origin;
  const {
    data: discussion,
    isFetching: discussionLoading,
    isError: discussionError,
  } = useVoteDiscussion({
    identifier,
    time,
    title,
  });
  const { data: claim } = useAssertionClaim(assertionChildChainId, assertionId);
  const { data: augmentedVoteData } = useAugmentedVoteData({
    time,
    identifier: decodedIdentifier,
    ancillaryData: ancillaryDataL2,
  });

  const claimTitle = claim ? getClaimTitle(decodeHexString(claim)) : undefined;

  const titleOrClaimOrIdentifier =
    optimisticGovernorTitle ||
    removeMarkdown(claimTitle ?? claim ?? title ?? decodedIdentifier);

  const titleToShow =
    titleOrClaimOrIdentifier.length > 100
      ? titleOrClaimOrIdentifier.slice(0, 50) + "..."
      : titleOrClaimOrIdentifier;

  function makeTabs() {
    const hasResults = Boolean(results?.length);

    const tabsAllEnvironments = [
      {
        title: "Details",
        content: <Details {...content} />,
      },
      ...(content.origin === "Polymarket"
        ? [
            {
              title: "Discord Summary",
              content: (
                <DiscussionSummary query={content} bulletins={bulletins.data} />
              ),
            },
          ]
        : []),
    ];

    const productionTabs = [
      {
        title: "Discord Comments",
        content: (
          <Discussion
            discussion={discussion}
            loading={Boolean(discussionLoading && !discussion)}
            bulletins={bulletins.data}
            error={discussionError}
          />
        ),
      },
    ];

    const tabs = config.isProduction
      ? tabsAllEnvironments.concat(productionTabs)
      : tabsAllEnvironments;

    // add result tab if there are results
    // and make it the first tab
    if (hasResults) {
      tabs.unshift({
        title: "Result",
        content: (
          <Result
            decodedIdentifier={decodedIdentifier}
            participation={participation}
            results={results}
            options={options}
            proposedPrice={augmentedVoteData?.proposedPrice}
          />
        ),
      });
    }

    // Check if selected tab exists in current tabs
    const tabTitles = tabs.map((tab) => tab.title);
    const defaultTab = hasResults ? "Result" : "Details";

    // If selectedTab doesn't exist in current tabs, use default
    const currentTab =
      selectedTab && tabTitles.includes(selectedTab) ? selectedTab : defaultTab;

    return (
      <Tabs
        tabs={tabs}
        defaultValue={defaultTab}
        value={currentTab}
        onValueChange={setSelectedTab}
      />
    );
  }

  return (
    <PanelWrapper>
      <PanelTitle
        title={titleToShow}
        origin={voteOrigin}
        isGovernance={isGovernance}
        voteNumber={resolvedPriceRequestIndex}
      />
      {hasNavigation && (
        <NavigationBar>
          <NavButton onClick={goToPrevVote} disabled={!canGoPrev}>
            <LeftChevron />
          </NavButton>
          <NavCounter>
            {currentVoteIndex + 1} of {navigableVotes.length}
          </NavCounter>
          <NavButton onClick={goToNextVote} disabled={!canGoNext}>
            <RightChevron />
          </NavButton>
        </NavigationBar>
      )}
      {showVoteInput && (
        <VotePanelVoteInput
          vote={content}
          selectedValue={selectedVotes[content.uniqueKey]}
          onSelectVote={selectVote}
        />
      )}
      {makeTabs()}
      <PanelFooter />
    </PanelWrapper>
  );
}

export const PanelContentWrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
  width: calc(var(--panel-width) - 15px);

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-block: 12px;
  padding-inline: 30px;
  border-bottom: 1px solid var(--grey-100);

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const NavButton = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background 150ms;

  &:hover:not(:disabled) {
    background: var(--grey-100);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const NavCounter = styled.span`
  font: var(--text-sm);
  color: var(--grey-800);
  min-width: 60px;
  text-align: center;
`;
