import { Meta, StoryObj } from "@storybook/react";
import {
  VotesContext,
  VotesContextState,
  defaultVotesContextState,
} from "contexts";
import PastVotesPage from "pages/past-votes";
import {
  makeMockVotes,
  mockCommitted,
  mockEncryptedAndDecrypted,
  polymarketVote,
  polymarketVoteCommitted,
  polymarketVoteCommittedCustomInput,
} from "stories/mocks/votes";
import { VoteT } from "types";

interface Args {
  votes: VoteT[];
}
const meta: Meta = {
  title: "Pages/PastVotesPage",
  component: PastVotesPage,
};

export default meta;

type Story = StoryObj<Args>;

const Template: Story = {
  render: function Wrapper(args) {
    const mockVoteContextState: VotesContextState = {
      ...defaultVotesContextState,
      pastVoteList: args.votes ?? [],
    };

    return (
      <VotesContext.Provider value={mockVoteContextState}>
        <PastVotesPage />
      </VotesContext.Provider>
    );
  },
};

export const Default: Story = {
  ...Template,
  args: {
    votes: makeMockVotes({
      count: 100,
      inputs: [
        mockEncryptedAndDecrypted,
        mockCommitted,
        polymarketVote,
        polymarketVoteCommitted,
        polymarketVoteCommittedCustomInput,
      ],
    }),
  },
};
