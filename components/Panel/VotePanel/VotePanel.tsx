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

  const { description, options, timestamp, links, discordLink } = content as VotePanelContentT;

  const tabs = [
    {
      title: "Result",
      content: <Result />,
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
      <PanelTitle panelContent={content} panelType="vote" />
      <Tabs tabs={tabs} />
      <PanelFooter />
    </PanelWrapper>
  );
}
