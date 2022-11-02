/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useArgs } from "@storybook/client-api";
import { Meta, Story } from "@storybook/react";
import { Pagination } from "components";
import { Props as PaginationProps } from "components/Pagination/Pagination";
import { grey100 } from "constant";
import { defaultPaginationContextState, PaginationContext, PaginationContextState } from "contexts";
import { defaultPageStates } from "contexts/PaginationContext";
import { PageStatesT, PaginateForT } from "types/global";

interface StoryProps extends PaginationProps {
  pageStates: PageStatesT;
  paginateFor: PaginateForT;
  resultsPerPage: number;
}

export default {
  title: "Base components/Navigation/Pagination",
  component: Pagination,
  decorators: [
    (Story, { args }) => {
      const [_args, updateArgs] = useArgs();

      const pageStates = args.pageStates ?? defaultPageStates;

      function goToPage(paginateFor: PaginateForT, number: number) {
        updateArgs({ ...pageStates, [paginateFor]: (pageStates[paginateFor].number = number) });
      }

      function nextPage(paginateFor: PaginateForT) {
        updateArgs({
          ...pageStates,
          [paginateFor]: (pageStates[paginateFor].number = pageStates[paginateFor].number + 1),
        });
      }

      function previousPage(paginateFor: PaginateForT) {
        updateArgs({
          ...pageStates,
          [paginateFor]: (pageStates[paginateFor].number = pageStates[paginateFor].number - 1),
        });
      }

      function setResultsPerPage(paginateFor: PaginateForT, resultsPerPage: number) {
        updateArgs({
          ...pageStates,
          [paginateFor]: (pageStates[paginateFor].resultsPerPage = resultsPerPage),
        });
      }

      const mockPaginationContextState: PaginationContextState = {
        ...defaultPaginationContextState,
        pageStates,
        goToPage,
        nextPage,
        previousPage,
        setResultsPerPage,
      };

      return (
        <PaginationContext.Provider value={mockPaginationContextState}>
          <Story />
        </PaginationContext.Provider>
      );
    },
    (Story) => (
      <div style={{ width: "100%", maxWidth: "600px", background: grey100, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => <Pagination {...args} />;

export const PastVotes = Template.bind({});
PastVotes.args = {
  paginateFor: "pastVotesPage",
};
