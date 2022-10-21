/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Meta, Story } from "@storybook/react";
import { Header } from "components";
import { defaultDelegationContextState, DelegationContext, DelegationContextState } from "contexts";
import { DelegationStatusT } from "types";

interface StoryProps {
  delegationStatus: DelegationStatusT;
}
export default {
  title: "Base components/Navigation/Header",
  component: Header,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  decorators: [
    (Story, { args }) => {
      const mockDelegationContextState: DelegationContextState = {
        ...defaultDelegationContextState,
        getDelegationStatus: () => args.delegationStatus ?? "no-delegation",
      };

      return (
        <DelegationContext.Provider value={mockDelegationContextState}>
          <Story />
        </DelegationContext.Provider>
      );
    },
  ],
} as Meta<StoryProps>;

const Template: Story<StoryProps> = () => <Header />;

export const Default = Template.bind({});

export const WithReceivedRequestToBeDelegate = Template.bind({});
WithReceivedRequestToBeDelegate.args = {
  delegationStatus: "delegate-pending",
};
