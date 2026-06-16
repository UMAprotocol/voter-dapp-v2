import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { ReactNode } from "react";
import styled from "styled-components";
import { mobileAndUnder } from "constant";

type Tab = {
  title: string;
  content: ReactNode;
};

export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  stickyHeader,
}: {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  stickyHeader?: ReactNode;
}) {
  const tabsList = (
    <TabsList>
      {tabs.map(({ title }) => (
        <TabsTrigger key={title} value={title}>
          {title}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <TabsRoot
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      {stickyHeader ? (
        <StickyHeader>
          {stickyHeader}
          {tabsList}
        </StickyHeader>
      ) : (
        tabsList
      )}
      {tabs.map(({ content, title }) => (
        <TabsContent value={title} key={title}>
          {content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

const TabsRoot = styled(Root)``;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background: var(--white);
`;

const TabsList = styled(List)`
  height: 45px;
  display: flex;
  align-items: center;
  gap: 50px;
  padding-left: 30px;
  background: var(--grey-50);
  overflow-x: auto;

  @media ${mobileAndUnder} {
    gap: 5px;
    padding-left: 15px;
    padding-right: 15px;
    height: 45px;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const TabsTrigger = styled(Trigger)`
  height: 100%;
  padding-bottom: 3px;
  background: transparent;
  font: var(--text-md);
  white-space: nowrap;
  flex-shrink: 0;

  &[data-state="active"] {
    padding-bottom: 0;
    border-bottom: 3px solid var(--red-500);
  }

  @media ${mobileAndUnder} {
    padding: 8px 4px;
    padding-bottom: 3px;
    height: 100%;

    &[data-state="active"] {
      padding-bottom: 0;
      border-bottom: 3px solid var(--red-500);
    }
  }
`;

const TabsContent = styled(Content)`
  background: transparent;
  color: var(--black);
  font: var(--text-md);
  cursor: unset;
`;
