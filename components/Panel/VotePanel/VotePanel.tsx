import removeMarkdown from "remove-markdown";

import { Tabs } from "components";
import { decodeHexString, getClaimTitle } from "helpers";
import { getOptimisticGovernorTitle } from "helpers/voting/optimisticGovernor";
import {
  useVoteDiscussion,
  useAssertionClaim,
  useAugmentedVoteData,
} from "hooks";
import { useOptimisticGovernorData } from "hooks/queries/votes/useOptimisticGovernorData";
import { VoteT } from "types";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Discussion } from "./Discussion";
import { Result } from "./Result";
import { usePolymarketBulletins } from "hooks";

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

    const tabs = [
      {
        title: "Details",
        content: <Details {...content} />,
      },
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

    return (
      <Tabs
        tabs={tabs}
        defaultValue={hasResults ? "Result" : "Discord Comments"}
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
      {makeTabs()}
      <PanelFooter />
    </PanelWrapper>
  );
}
