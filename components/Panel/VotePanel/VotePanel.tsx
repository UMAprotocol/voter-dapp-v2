import { Tabs } from "components";
import { PanelContentT } from "types";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Result } from "./Result";

interface Props {
  content: PanelContentT | undefined;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const {
    title,
    decodedIdentifier,
    decodedAncillaryData,
    voteNumber,
    description,
    origin,
    options,
    timeAsDate,
    links,
    discordLink,
    participation,
    results,
  } = content;

  const hasResults = Boolean(results?.length);

  const tabs = [
    {
      title: "Result",
      content: <Result participation={participation} results={results} />,
    },
    {
      title: "Details",
      content: (
        <Details
          description={description}
          decodedAncillaryData={decodedAncillaryData}
          options={options}
          timeAsDate={timeAsDate}
          links={links}
          discordLink={discordLink}
        />
      ),
    },
  ];

  return (
    <PanelWrapper>
      <PanelTitle
        title={title ?? decodedIdentifier}
        origin={origin}
        voteNumber={voteNumber.toString()}
      />
      {hasResults ? (
        <Tabs tabs={tabs} />
      ) : (
        <Details
          description={description}
          decodedAncillaryData={decodedAncillaryData}
          options={options}
          timeAsDate={timeAsDate}
          links={links}
          discordLink={discordLink}
        />
      )}
      <PanelFooter />
    </PanelWrapper>
  );
}
