import { Tabs } from "components/Tabs";
import { PanelContentT, VotePanelContentT } from "types/global";
import { PanelFooter } from "../PanelFooter";
import { PanelTitle } from "../PanelTitle";
import { PanelWrapper } from "../styles";
import { Details } from "./Details";
import { Result } from "./Result";

interface Props {
  content: PanelContentT;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const {
    title,
    decodedIdentifier,
    decodedAncillaryData,
    description,
    origin,
    options,
    timeAsDate,
    links,
    discordLink,
    participation,
    results,
  } = content as VotePanelContentT;

  const hasResults = Boolean(results);

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
      {/* todo add vote number implementation */}
      <PanelTitle title={title ?? decodedIdentifier} origin={origin} voteNumber={123} />
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
