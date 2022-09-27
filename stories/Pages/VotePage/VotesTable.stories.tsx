import { Meta, Story } from "@storybook/react";
import { VotesTable } from "components";
import {
  Active as ActiveHeading,
  Past as PastHeading,
  Upcoming as UpcomingHeading,
} from "stories/Pages/VotePage/VotesTableHeadings.stories";
import {
  ActiveCommitted,
  ActiveNotCommitted,
  ActiveNotRevealed,
  ActiveRevealButDidNotVote,
  ActiveRevealed,
  PastVoteDidNotVote,
  PastVoteDidVote,
  UpcomingVote,
} from "./VoteTableRow.stories";

interface StoryProps {
  headings: JSX.Element;
  rows: JSX.Element[];
}
export default {
  title: "Pages/Vote Page/VotesTable",
  component: VotesTable,
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: "grey" }}>
        <Story />
      </div>
    ),
  ],
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  return <VotesTable {...args} />;
};

export const ActiveCommit = Template.bind({});
ActiveCommit.args = {
  // @ts-expect-error - Storybook makes all args optional, but we know they're not.
  headings: <ActiveHeading activityStatus={ActiveHeading.args.activityStatus} />,
  rows: [
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveNotCommitted {...ActiveNotCommitted.args} key={1} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveCommitted {...ActiveCommitted.args} key={2} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveNotCommitted {...ActiveNotCommitted.args} key={3} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveCommitted {...ActiveCommitted.args} key={4} />,
  ],
};

export const ActiveReveal = Template.bind({});
ActiveReveal.args = {
  // @ts-expect-error - Storybook makes all args optional, but we know they're not.
  headings: <ActiveHeading activityStatus={ActiveHeading.args.activityStatus} />,
  rows: [
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveNotRevealed {...ActiveNotRevealed.args} key={1} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveRevealButDidNotVote {...ActiveRevealButDidNotVote.args} key={2} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveRevealed {...ActiveRevealed.args} key={3} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveNotRevealed {...ActiveNotRevealed.args} key={4} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveRevealed {...ActiveRevealed.args} key={5} />,
  ],
};

export const Upcoming = Template.bind({});
Upcoming.args = {
  // @ts-expect-error - Storybook makes all args optional, but we know they're not.
  headings: <UpcomingHeading activityStatus={UpcomingHeading.args.activityStatus} />,
  rows: [
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <UpcomingVote {...UpcomingVote.args} key={1} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <UpcomingVote {...UpcomingVote.args} key={2} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <UpcomingVote {...UpcomingVote.args} key={3} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <UpcomingVote {...UpcomingVote.args} key={4} />,
  ],
};

export const Past = Template.bind({});
Past.args = {
  // @ts-expect-error - Storybook makes all args optional, but we know they're not.
  headings: <PastHeading activityStatus={PastHeading.args.activityStatus} />,
  rows: [
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <PastVoteDidNotVote {...PastVoteDidNotVote.args} key={1} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <PastVoteDidVote {...PastVoteDidVote.args} key={2} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <PastVoteDidNotVote {...PastVoteDidNotVote.args} key={3} />,
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <PastVoteDidVote {...PastVoteDidVote.args} key={4} />,
  ],
};
