import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Votes } from "components/Votes";
import { desktopMaxWidth } from "constants/containers";
import { VoteTimelineT } from "types/global";
import * as VoteBarStories from "./VoteBar.stories";
import { CommitPhase } from "./VoteTimeline.stories";

export default {
  title: "Pages/Vote Page/Votes",
  component: Votes,
  decorators: [
    (Story) => (
      <div style={{ width: desktopMaxWidth }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Votes>;

const Template: ComponentStory<typeof Votes> = (args) => <Votes {...args} />;

export const Default = Template.bind({});
Default.args = {
  votes: [
    VoteBarStories.OriginUmaNotCommitted.args!.vote!,
    VoteBarStories.OriginPolymarketNotCommitted.args!.vote!,
    VoteBarStories.OriginUmaCommitted.args!.vote!,
    VoteBarStories.OriginPolymarketCommitted.args!.vote!,
  ],
  voteTimeline: CommitPhase.args! as VoteTimelineT,
};
