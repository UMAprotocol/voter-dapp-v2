import { ComponentMeta, ComponentStory } from "@storybook/react";
import { VoteBar } from "components/VoteBar";
import { sub } from "date-fns";

export default {
  title: "Pages/Vote Page/VoteBar",
  component: VoteBar,
  decorators: [
    (Story) => (
      <div style={{ width: 1100 }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof VoteBar>;

const Template: ComponentStory<typeof VoteBar> = (args) => <VoteBar {...args} />;

export const OriginUmaNotCommitted = Template.bind({});
OriginUmaNotCommitted.args = {
  phase: "commit",
  vote: {
    title: "SuperUMAn DAO KPI Options funding proposal",
    origin: "UMA",
    description: "Some description",
    transactionHash: "0x1234567890",
    umipUrl: "https://uma.io",
    timeAsDate: sub(new Date(), { days: 1 }),
    time: sub(new Date(), { days: 1 }).getTime() / 1000,
    timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
    identifier: "0x1234567890",
    ancillaryData: "0x1234567890",
    decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
    decodedAncillaryData: "Test test test",
    uniqueKey: "0x1234567890",
    umipNumber: 20,
    encryptedVote: undefined,
    decryptedVote: undefined,
    contentfulData: undefined,
    options: [
      { label: "Yes", value: "p0", secondaryLabel: "p0" },
      { label: "No", value: "p1", secondaryLabel: "p1" },
      { label: "Unknown", value: "p2", secondaryLabel: "p2" },
      { label: "Early Request", value: "p3", secondaryLabel: "p3" },
    ],
    links: [
      {
        label: "UMIP link",
        href: "https://www.todo.com",
      },
      {
        label: "Dispute txid",
        href: "https://www.todo.com",
      },
      {
        label: "Optimistic Oracle UI",
        href: "https://www.todo.com",
      },
    ],
    discordLink: "https://www.todo.com",
    isCommitted: false,
    isGovernance: false,
    isRevealed: false,
  },
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginUmaCommitted = Template.bind({});
OriginUmaCommitted.args = {
  ...OriginUmaNotCommitted.args,
  vote: {
    ...OriginUmaNotCommitted.args!.vote!,
    isCommitted: true,
  },
};

export const OriginPolymarketNotCommitted = Template.bind({});
OriginPolymarketNotCommitted.args = {
  phase: "commit",
  vote: {
    title: "George Kambosos Jr. vs. Devin Haney",
    origin: "Polymarket",
    encryptedVote: undefined,
    decryptedVote: undefined,
    contentfulData: undefined,
    description: "Some description",
    transactionHash: "0x1234567890",
    umipUrl: "https://uma.io",
    timeAsDate: sub(new Date(), { days: 1 }),
    time: sub(new Date(), { days: 1 }).getTime() / 1000,
    timeMilliseconds: sub(new Date(), { days: 1 }).getTime(),
    identifier: "0x1234567890",
    ancillaryData: "0x1234567890",
    decodedIdentifier: "SuperUMAn DAO KPI Options funding proposal",
    decodedAncillaryData: "Test test test",
    uniqueKey: "0x1234567890",
    umipNumber: 20,
    options: [
      { label: "Yes", value: "p0", secondaryLabel: "p0" },
      { label: "No", value: "p1", secondaryLabel: "p1" },
      { label: "Unknown", value: "p2", secondaryLabel: "p2" },
      { label: "Early Request", value: "p3", secondaryLabel: "p3" },
    ],
    links: [
      {
        label: "UMIP link",
        href: "https://www.todo.com",
      },
      {
        label: "Dispute txid",
        href: "https://www.todo.com",
      },
      {
        label: "Optimistic Oracle UI",
        href: "https://www.todo.com",
      },
    ],
    discordLink: "https://www.todo.com",
    isCommitted: false,
    isGovernance: false,
    isRevealed: false,
  },
  moreDetailsAction: () => console.log("More details clicked"),
};

export const OriginPolymarketCommitted = Template.bind({});
OriginPolymarketCommitted.args = {
  ...OriginPolymarketNotCommitted.args,
  vote: {
    ...OriginPolymarketNotCommitted.args!.vote!,
    isCommitted: true,
  },
};

export const WithLongTitle = Template.bind({});
WithLongTitle.args = {
  ...OriginPolymarketNotCommitted.args,
  vote: {
    ...OriginPolymarketNotCommitted.args!.vote!,
    title: "Will Coinbase support Polygon USDC deposits & withdrawals by June 30, 2022?",
  },
};
