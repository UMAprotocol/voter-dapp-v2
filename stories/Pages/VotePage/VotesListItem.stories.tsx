import { expect } from "@storybook/jest";
import { Meta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { VotesList, VotesListItem, VotesTableHeadings } from "components";
import { useState } from "react";
import {
  defaultMockVote,
  makeMockVotes,
  mockCommitted,
  mockCorrectVote,
  mockRevealed,
  polymarketVote,
  polymarketVoteCommitted,
  polymarketVoteCommittedCustomInput,
} from "stories/mocks/votes";

const meta: Meta = {
  title: "Pages/Vote Page/VotesListItem",
  component: VotesListItem,
};

export default meta;

type Story = StoryObj<typeof VotesListItem>;

const Template: Story = {
  render: function Wrapper(args) {
    const [selectedVote, setSelectedVote] = useState<string | undefined>(
      undefined
    );
    return (
      <div style={{ maxWidth: "var(--page-width)" }}>
        <VotesList
          headings={<VotesTableHeadings {...args} />}
          rows={[
            <VotesListItem
              {...args}
              key="only one here"
              selectedVote={selectedVote}
              selectVote={setSelectedVote}
              clearVote={() => setSelectedVote(undefined)}
            />,
          ]}
        />
      </div>
    );
  },
};

const mockMoreDetailsAction = () => alert("More details clicked");

const [
  _mockCommitted,
  _mockRevealed,
  _voteWithCorrectVoteWithoutUserVote,
  _voteWithCorrectVoteWithUserVote,
  _polymarketVote,
  _polymarketVoteCommitted,
  _polymarketVoteCommittedCustomInput,
] = makeMockVotes({
  inputs: [
    mockCommitted,
    mockRevealed,
    mockCorrectVote,
    { ...mockCommitted, ...mockRevealed, ...mockCorrectVote },
    polymarketVote,
    polymarketVoteCommitted,
    polymarketVoteCommittedCustomInput,
  ],
});

const commonArgs = {
  moreDetailsAction: mockMoreDetailsAction,
};

const activeVotesCommonArgs = {
  ...commonArgs,
  activityStatus: "active" as const,
};

const pastVoteCommonArgs = {
  ...commonArgs,
  activityStatus: "past" as const,
};

// active votes

// we only show `isCommitted` and `isRevealed` when we are dealing with active votes. This information is not relevant for upcoming votes, and it is redundant for past votes (we can simply show the user's votes instead).

export const ActiveNotCommitted: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: defaultMockVote(),
  },
};

export const ActiveCommitted: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: _mockCommitted,
  },
};

export const ActiveNotRevealed: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: _mockCommitted,
  },
};

export const ActiveRevealed: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: _mockRevealed,
  },
};

export const ActiveRevealButDidNotVote: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "reveal",
    vote: defaultMockVote(),
  },
};

// upcoming votes

export const UpcomingVote: Story = {
  ...Template,
  args: {
    ...commonArgs,
    vote: defaultMockVote(),
    activityStatus: "upcoming",
  },
};

// past votes

export const PastVoteDidNotVote: Story = {
  ...Template,
  args: {
    ...pastVoteCommonArgs,
    vote: _voteWithCorrectVoteWithoutUserVote,
  },
};

export const PastVoteDidVote: Story = {
  ...Template,
  args: {
    ...pastVoteCommonArgs,
    vote: _voteWithCorrectVoteWithUserVote,
  },
};

export const PolymarketNotCommitted: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: _polymarketVote,
  },
};

export const TestCustomInputNotCommitted: Story = {
  ...PolymarketNotCommitted,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement as HTMLElement);
    let chooseAnswer = await canvas.findByText("Choose answer");
    await waitFor(() => userEvent.click(chooseAnswer));
    const custom = await canvas.findByText("Custom");
    await waitFor(() => userEvent.click(custom));
    await waitFor(() => userEvent.click(custom));
    const input = await canvas.findByPlaceholderText("Enter value");
    await waitFor(() => userEvent.type(input, "123"));
    const exitButton = await canvas.findByLabelText("exit custom input");
    await waitFor(() => userEvent.click(exitButton));
    chooseAnswer = await canvas.findByText("Choose answer");
    expect(chooseAnswer).toBeInTheDocument();
  },
};

export const PolymarketCommitted: Story = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit",
    vote: _polymarketVoteCommitted,
  },
};

export const TestCustomInputCommitted: Story = {
  ...PolymarketCommitted,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement as HTMLElement);
    let chosenAnswer = await canvas.findByText("Something");
    await waitFor(() => userEvent.click(chosenAnswer));
    const custom = await canvas.findByText("Custom");
    await waitFor(() => userEvent.click(custom));
    await waitFor(() => userEvent.click(custom));
    const input = await canvas.findByPlaceholderText("Enter value");
    await waitFor(() => userEvent.type(input, "123"));
    const exitButton = await canvas.findByLabelText("exit custom input");
    await waitFor(() => userEvent.click(exitButton));
    chosenAnswer = await canvas.findByText("Something");
    expect(chosenAnswer).toBeInTheDocument();
  },
};

export const PolymarketCommittedCustomValue = {
  ...Template,
  args: {
    ...activeVotesCommonArgs,
    phase: "commit" as const,
    vote: _polymarketVoteCommittedCustomInput,
  },
};

export const TestCustomInputCommittedWithCustomValue: Story = {
  ...PolymarketCommittedCustomValue,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement as HTMLElement);
    const customValueInput = await canvas.findByDisplayValue("123");
    expect(customValueInput).toBeInTheDocument();
    const exitButton = await canvas.findByLabelText("exit custom input");
    await waitFor(() => userEvent.click(exitButton));
    const chooseAnswer = await canvas.findByText("Choose answer");
    expect(chooseAnswer).toBeInTheDocument();
  },
};
