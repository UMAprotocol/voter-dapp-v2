import {
  Tab as ReachTab,
  TabList as ReachTabList,
  TabPanel as ReachTabPanel,
  TabPanels as ReachTabPanels,
  Tabs as ReachTabs,
} from "@reach/tabs";
import { ReactNode } from "react";
import styled from "styled-components";

type Tab = {
  title: string;
  content: ReactNode;
};

interface Props {
  tabs: Tab[];
}
export function Tabs({ tabs }: Props) {
  return (
    <TabsWrapper>
      <TabList>
        {tabs.map(({ title }) => (
          <Tab key={title}>{title}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map(({ content }) => (
          <TabPanel key={content?.toString()}>{content}</TabPanel>
        ))}
      </TabPanels>
    </TabsWrapper>
  );
}
const TabsWrapper = styled(ReachTabs)``;

const TabList = styled(ReachTabList)`
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  gap: 50px;
  padding-left: 30px;
  background: var(--grey-50);

  [data-selected] {
    border-bottom: 3px solid var(--red);
  }
`;

const Tab = styled(ReachTab)`
  height: 100%;
  background: transparent;
  color: var(--black);
  font: var(--text-md);
  padding-inline: 3px;
  border-bottom: 3px solid transparent;
`;

const TabPanels = styled(ReachTabPanels)``;

const TabPanel = styled(ReachTabPanel)``;
