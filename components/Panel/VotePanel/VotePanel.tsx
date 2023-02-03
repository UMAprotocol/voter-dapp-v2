import { Tabs } from "components";
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
  } = content;

  const { data: discussion, isFetching: discussionLoading } = useVoteDiscussion(
    {
      identifier,
      time,
    }
  );

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

    return <Tabs tabs={tabs} />;
  }

  return (
    <PanelWrapper>
      <PanelTitle
        title={title ?? decodedIdentifier}
        origin={origin}
        isGovernance={isGovernance}
        voteNumber={resolvedPriceRequestIndex}
      />
      {makeTabs()}
      <PanelFooter />
    </PanelWrapper>
  );
}
