import { Meta, Story } from "@storybook/react";
import { VoteTimeline } from "components/VoteTimeline";
import { defaultVotesContextState, VotesContext } from "contexts/VotesContext";
import { defaultVoteTimingContextState, VoteTimingContext } from "contexts/VoteTimingContext";

interface StoryProps {
  phase: "commit" | "reveal";
  millisecondsUntilPhaseEnds: number;
  activityStatus: "active" | "upcoming" | "past";
}

const defaultArgs = {
  millisecondsUntilPhaseEnds: 1000 * 60 * 5,
};

const commitPhaseDefaultArgs = {
  ...defaultArgs,
  phase: "commit" as const,
};

const revealPhaseDefaultArgs = {
  ...defaultArgs,
  phase: "reveal" as const,
};

export default {
  title: "Pages/Vote Page/VoteTimeline",
  component: VoteTimeline,
  argTypes: {
    phase: {
      options: ["commit", "reveal"],
      control: {
        type: "radio",
      },
    },
    activityStatus: {
      options: ["active", "upcoming", "past"],
      control: {
        type: "radio",
      },
    },
    millisecondsUntilPhaseEnds: {
      control: {
        type: "range",
        min: 0,
        max: 1000 * 60 * 10,
        step: 1000,
      },
    },
  },
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  const mockVoteTimingContextState = {
    ...defaultVoteTimingContextState,
    phase: args.phase ?? "commit",
    millisecondsUntilPhaseEnds: args.millisecondsUntilPhaseEnds,
  };

  const mockVotesContextState = {
    ...defaultVotesContextState,
    getActivityStatus: () => args.activityStatus ?? "active",
  };
  return (
    <VoteTimingContext.Provider value={mockVoteTimingContextState}>
      <VotesContext.Provider value={mockVotesContextState}>
        <VoteTimeline />
      </VotesContext.Provider>
    </VoteTimingContext.Provider>
  );
};

export const CommitPhaseActive = Template.bind({});
CommitPhaseActive.args = {
  ...commitPhaseDefaultArgs,
  activityStatus: "active",
};

export const CommitPhaseUpcoming = Template.bind({});
CommitPhaseUpcoming.args = {
  ...commitPhaseDefaultArgs,
  activityStatus: "upcoming",
};

export const CommitPhasePast = Template.bind({});
CommitPhasePast.args = {
  ...commitPhaseDefaultArgs,
  phase: "commit",
};

export const RevealPhaseActive = Template.bind({});
RevealPhaseActive.args = {
  ...revealPhaseDefaultArgs,
  activityStatus: "active",
};

export const RevealPhaseUpcoming = Template.bind({});
RevealPhaseUpcoming.args = {
  ...revealPhaseDefaultArgs,
  activityStatus: "upcoming",
};

export const RevealPhasePast = Template.bind({});
RevealPhasePast.args = {
  ...revealPhaseDefaultArgs,
  activityStatus: "past",
};
