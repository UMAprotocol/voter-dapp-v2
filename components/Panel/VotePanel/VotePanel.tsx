import { Tabs } from "components";
import { PanelContentT } from "types";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Discussion } from "./Discussion";
import { Result } from "./Result";

interface Props {
  content: PanelContentT | undefined;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const {
    title,
    decodedIdentifier,
    voteNumber,
    origin,
    participation,
    results,
    isGovernance,
    options,
  } = content;

  const hasResults = Boolean(results?.length);

  const tabs = [
    {
      title: "Result",
      content: (
        <Result
          decodedIdentifier={decodedIdentifier}
          participation={participation}
          results={results}
          options={options}
        />
      ),
    },
    {
      title: "Details",
      content: <Details {...content} />,
    },
    {
      title: "Discussion",
      content: <Discussion {...content} />,
    },
  ];

  return (
    <PanelWrapper>
      <PanelTitle
        title={title ?? decodedIdentifier}
        origin={origin}
        isGovernance={isGovernance}
        voteNumber={voteNumber?.toString()}
      />
      {hasResults ? <Tabs tabs={tabs} /> : <Details {...content} />}
      <PanelFooter />
    </PanelWrapper>
  );
}
