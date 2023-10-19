import { Tabs } from "components";
import { decodeHexString } from "helpers";
import { useVoteDiscussion } from "hooks";
import { VoteT } from "types";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Discussion } from "./Discussion";
import { Result } from "./Result";

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
    augmentedData,
  } = content;

  const { data: discussion, isFetching: discussionLoading } = useVoteDiscussion(
    {
      identifier,
      time,
    }
  );
  const claim = augmentedData?.optimisticOracleV3Data?.claim;

  const titleOrClaimOrIdentifier = claim
    ? decodeHexString(claim)
    : title ?? decodedIdentifier;

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
        title: "Discussion",
        content: (
          <Discussion discussion={discussion} loading={discussionLoading} />
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
          />
        ),
      });
    }

    return (
      <Tabs tabs={tabs} defaultValue={hasResults ? "Result" : "Discussion"} />
    );
  }

  return (
    <PanelWrapper>
      <PanelTitle
        title={titleToShow}
        origin={origin}
        isGovernance={isGovernance}
        voteNumber={resolvedPriceRequestIndex}
      />
      {makeTabs()}
      <PanelFooter />
    </PanelWrapper>
  );
}
