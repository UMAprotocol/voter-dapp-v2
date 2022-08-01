import styled from "styled-components";
import { PanelContentT } from "types/global";
import { PanelTitle } from "../PanelTitle";
import { PanelFooter } from "../PanelFooter";
import { Tabs } from "components/Tabs";
import { Details } from "./Details";
import { Result } from "./Result";

interface Props {
  content: PanelContentT;
}
export function VotePanel({ content }: Props) {
  if (!content) return null;

  const { description, options, timestamp, links, discordLink } = content;

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
    <Wrapper>
      <PanelTitle panelContent={content} panelType="vote" />
      <Tabs tabs={tabs} />
      <PanelFooter />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;
