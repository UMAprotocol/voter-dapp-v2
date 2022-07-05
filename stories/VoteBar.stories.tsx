import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteBar } from "components/VoteBar";
import { DisputeOriginT } from "types/global";

export default {
  title: "VoteBar",
  component: VoteBar,
  decorators: [
    (Story) => (
      <div style={{ width: 1190 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof VoteBar>;

const Template: ComponentStory<typeof VoteBar> = (args) => <VoteBar {...args} />;

export const OriginUmaNotCommitted = Template.bind({});
OriginUmaNotCommitted.args = {
  dispute: {
    title: "SuperUMAn DAO KPI Options funding proposal",
    origin: DisputeOriginT.UMA,
  },
  voteOptions: [
    { label: "Yes", value: "p0", secondaryLabel: "p0" },
    { label: "No", value: "p1", secondaryLabel: "p1" },
    { label: "Unknown", value: "p2", secondaryLabel: "p2" },
    { label: "Early Request", value: "p3", secondaryLabel: "p3" },
  ],
  isCommitted: false,
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginUmaCommitted = Template.bind({});
OriginUmaCommitted.args = {
  ...OriginUmaNotCommitted.args,
  isCommitted: true,
};

export const OriginPolymarketNotCommitted = Template.bind({});
OriginPolymarketNotCommitted.args = {
  dispute: {
    title: "George Kambosos Jr. vs. Devin Haney",
    origin: DisputeOriginT.Polymarket,
  },
  voteOptions: [
    { label: "Yes", value: "p0", secondaryLabel: "p0" },
    { label: "No", value: "p1", secondaryLabel: "p1" },
    { label: "Unknown", value: "p2", secondaryLabel: "p2" },
    { label: "Early Request", value: "p3", secondaryLabel: "p3" },
  ],
  isCommitted: false,
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginPolymarketCommitted = Template.bind({});
OriginPolymarketCommitted.args = {
  ...OriginPolymarketNotCommitted.args,
  isCommitted: true,
};
