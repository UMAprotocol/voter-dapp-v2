import { Meta, StoryObj } from "@storybook/react";
import {
  VotesContext,
  VotesContextState,
  defaultVotesContextState,
} from "contexts";
import UpcomingVotesPage from "pages/upcoming-votes";
import { makeMockVotes, polymarketVote } from "stories/mocks/votes";
import { VoteT } from "types";

interface Args {
  votes: VoteT[];
}
const meta: Meta = {
  title: "Pages/UpcomingVotesPage",
  component: UpcomingVotesPage,
};

export default meta;

type Story = StoryObj<Args>;

const Template: Story = {
  render: function Wrapper(args) {
    const mockVoteContextState: VotesContextState = {
      ...defaultVotesContextState,
      upcomingVoteList: args.votes ?? [],
    };

    return (
      <VotesContext.Provider value={mockVoteContextState}>
        <UpcomingVotesPage />
      </VotesContext.Provider>
    );
  },
};

export const Default: Story = {
  ...Template,
  args: {
    votes: makeMockVotes({
      count: 100,
      inputs: [polymarketVote],
    }),
  },
};
