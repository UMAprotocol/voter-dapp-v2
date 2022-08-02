import { PanelContentT, VotePanelContentT } from "types/global";
import { PanelTitle } from "../PanelTitle";
import { PanelFooter } from "../PanelFooter";
import { Tabs } from "components/Tabs";
import { Details } from "./Details";
import { Result } from "./Result";
import { PanelWrapper } from "../styles";

interface Props {
  content: PanelContentT;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const { title, description, origin, voteNumber, options, timestamp, links, discordLink, participation, results } =
    content as VotePanelContentT;

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
          options={options}
          timestamp={timestamp}
          links={links}
          discordLink={discordLink}
        />
      ),
    },
  ];

  return (
    <PanelWrapper>
      <PanelTitle title={title} origin={origin} voteNumber={voteNumber} />
      {hasResults ? (
        <Tabs tabs={tabs} />
      ) : (
        <Details
          description={description}
          options={options}
          timestamp={timestamp}
          links={links}
          discordLink={discordLink}
        />
      )}
      <PanelFooter />
    </PanelWrapper>
  );
}
