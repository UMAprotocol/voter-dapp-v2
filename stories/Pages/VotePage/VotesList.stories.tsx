import { Meta, Story } from "@storybook/react";
import { VotesList } from "components";
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
} from "./VotesListItem.stories";

interface StoryProps {
  headings: JSX.Element;
  rows: JSX.Element[];
}
export default {
  title: "Pages/Vote Page/VotesList",
  component: VotesList,
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: "var(--grey-100)" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: "mobile2",
    },
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  return <VotesList {...args} />;
};

export const ActiveCommit = Template.bind({});
ActiveCommit.args = {
  headings: (
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveHeading activityStatus={ActiveHeading.args.activityStatus} />
  ),
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
  headings: (
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <ActiveHeading activityStatus={ActiveHeading.args.activityStatus} />
  ),
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
  headings: (
    // @ts-expect-error - Storybook makes all args optional, but we know they're not.
    <UpcomingHeading activityStatus={UpcomingHeading.args.activityStatus} />
  ),
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