import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteBar } from "components/VoteBar";
import { desktopMaxWidth } from "constants/containers";
import { DisputeOrigins } from "types/global";

export default {
  title: "Pages/Overview Page/VoteBar",
  component: VoteBar,
  decorators: [
    (Story) => (
      <div style={{ width: desktopMaxWidth }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof VoteBar>;

const Template: ComponentStory<typeof VoteBar> = (args) => <VoteBar {...args} />;

export const OriginUmaNotCommitted = Template.bind({});
OriginUmaNotCommitted.args = {
  vote: {
    data: {
      title: "SuperUMAn DAO KPI Options funding proposal",
      origin: DisputeOrigins.UMA,
      voteNumber: 205,
      description: "Some description",
      timestamp: new Date(),
      txid: "0x1234567890",
      umipNumber: 20,
    },
    options: [
      { label: "Yes", value: "p0", secondaryLabel: "p0" },
      { label: "No", value: "p1", secondaryLabel: "p1" },
      { label: "Unknown", value: "p2", secondaryLabel: "p2" },
      { label: "Early Request", value: "p3", secondaryLabel: "p3" },
    ],
    isCommitted: false,
  },
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginUmaCommitted = Template.bind({});
OriginUmaCommitted.args = {
  ...OriginUmaNotCommitted.args,
  vote: {
    ...OriginUmaNotCommitted.args.vote!,
    isCommitted: true,
  },
};

export const OriginPolymarketNotCommitted = Template.bind({});
OriginPolymarketNotCommitted.args = {
  vote: {
    data: {
      title: "George Kambosos Jr. vs. Devin Haney",
      origin: DisputeOrigins.Polymarket,
      voteNumber: 205,
      description: "Some description",
      timestamp: new Date(),
      txid: "0x1234567890",
      umipNumber: 20,
    },
    options: [
      { label: "Yes", value: "p0", secondaryLabel: "p0" },
      { label: "No", value: "p1", secondaryLabel: "p1" },
      { label: "Unknown", value: "p2", secondaryLabel: "p2" },
      { label: "Early Request", value: "p3", secondaryLabel: "p3" },
    ],
    isCommitted: false,
  },
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginPolymarketCommitted = Template.bind({});
OriginPolymarketCommitted.args = {
  ...OriginPolymarketNotCommitted.args,
  vote: {
    ...OriginPolymarketNotCommitted.args.vote!,
    isCommitted: true,
  },
};
