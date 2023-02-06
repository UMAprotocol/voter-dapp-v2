import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { ReactNode } from "react";
import styled from "styled-components";

type Tab = {
  title: string;
  content: ReactNode;
};

export function Tabs({
  tabs,
  defaultValue,
}: {
  tabs: Tab[];
  defaultValue?: string;
}) {
  return (
    <TabsRoot defaultValue={defaultValue}>
      <TabsList>
        {tabs.map(({ title }) => (
          <TabsTrigger key={title} value={title}>
            {title}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ content, title }) => (
        <TabsContent value={title} key={title}>
          {content}
        </TabsContent>
      ))}
    </TabsRoot>
  );
}

const TabsRoot = styled(Root)``;

const TabsList = styled(List)`
  height: 45px;
  display: flex;
  align-items: center;
  gap: 50px;
  padding-left: 30px;
  background: var(--grey-50);
`;

const TabsTrigger = styled(Trigger)`
  height: 100%;
  padding-bottom: 3px;
  background: transparent;
  font: var(--text-md);
  &[data-state="active"] {
    padding-bottom: 0;
    border-bottom: 3px solid var(--red-500);
  }
`;

const TabsContent = styled(Content)`
  background: transparent;
  color: var(--black);
  font: var(--text-md);
  cursor: unset;
`;
