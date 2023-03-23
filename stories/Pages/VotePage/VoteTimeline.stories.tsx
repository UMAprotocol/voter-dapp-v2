import { Meta, StoryObj } from "@storybook/react";
import { VoteTimeline } from "components";
import {
  defaultVotesContextState,
  defaultVoteTimingContextState,
  VotesContext,
  VoteTimingContext,
} from "contexts";

interface Args {
  phase: "commit" | "reveal";
  millisecondsUntilPhaseEnds: number;
  activityStatus: "active" | "upcoming" | "past";
}

const meta: Meta<Args> = {
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
};

export default meta;

type Story = StoryObj<Args>;

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

const Template: Story = {
  render: (args) => {
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
  },
};

export const CommitPhaseActive: Story = {
  ...Template,
  args: {
    ...commitPhaseDefaultArgs,
    activityStatus: "active",
  },
};

export const CommitPhaseUpcoming: Story = {
  ...Template,
  args: {
    ...commitPhaseDefaultArgs,
    activityStatus: "upcoming",
  },
};

export const CommitPhasePast: Story = {
  ...Template,
  args: {
    ...commitPhaseDefaultArgs,
    activityStatus: "past",
  },
};

export const RevealPhaseActive: Story = {
  ...Template,
  args: {
    ...revealPhaseDefaultArgs,
    activityStatus: "active",
  },
};

export const RevealPhaseUpcoming: Story = {
  ...Template,
  args: {
    ...revealPhaseDefaultArgs,
    activityStatus: "upcoming",
  },
};

export const RevealPhasePast: Story = {
  ...Template,
  args: {
    ...revealPhaseDefaultArgs,
    activityStatus: "past",
  },
};
