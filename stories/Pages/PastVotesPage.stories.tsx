import { Meta, Story } from "@storybook/react";
import { VotesContext, defaultVotesContextState } from "contexts";
import { BigNumber } from "ethers";
import { uniqueId } from "lodash";
import PastVotesPage from "pages/past-votes";
import { VoteT } from "types";

const mockPastVotes = Array.from({ length: 200 }).map((_, i) => ({
  time: 1666025124,
  identifier:
    "0x5945535f4f525f4e4f5f51554552590000000000000000000000000000000000",
  ancillaryData:
    "0x713a224861642074686520666f6c6c6f77696e6720696e7375726564206576656e74206f63637572726564206173206f6620726571756573742074696d657374616d703a20546f6d20617465204a657272793f222c6f6f5265717565737465723a30343338653733386362376231656239386238636239663236643661313164353935303662396464",
  voteNumber: BigNumber.from("0x86"),
  timeMilliseconds: 1666025124000,
  timeAsDate: "2022-10-17T16:45:24.000Z",
  decodedIdentifier: "YES_OR_NO_QUERY",
  decodedAncillaryData:
    'q:"Had the following insured event occurred as of request timestamp: Tom ate Jerry?",ooRequester:0438e738cb7b1eb98b8cb9f26d6a11d59506b9dd',
  correctVote: 0,
  uniqueKey: uniqueId(),
  isCommitted: false,
  isRevealed: false,
  transactionHash:
    "0x2a37d6072ef32814755e67e40b118d5c3f8d389fb1d9e80f0a75037aa042ea39",
  voteHistory: {
    uniqueKey: uniqueId(),
    voted: false,
    correctness: null,
    slashAmount: BigNumber.from("-0x56bc75e2d631000000"),
    staking: true,
  },
  title: `Mock vote #${i + 1}`,
  description:
    'YES_OR_NO_QUERY is intended to be used with ancillary data to allow anyone to request an answer to a "yes or no" question from UMA governance.',
  umipUrl: "https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-107.md",
  links: [
    {
      label: "Vote transaction",
      href: "https://goerli.etherscan.io/tx/0x2a37d6072ef32814755e67e40b118d5c3f8d389fb1d9e80f0a75037aa042ea39",
    },
  ],
  origin: "UMA",
  isGovernance: false,
  discordLink: "https://discord.com/invite/jsb9XQJ",
  isRolled: false,
}));

interface StoryProps {
  votes: VoteT[];
}
export default {
  title: "Pages/Past Votes Page/PastVotesPage",
  component: PastVotesPage,
} as Meta<StoryProps>;

const Template: Story<StoryProps> = (args) => {
  const mockVotesContextState = {
    ...defaultVotesContextState,
    getPastVotes: () => args.votes ?? mockPastVotes,
  };

  return (
    <VotesContext.Provider value={mockVotesContextState}>
      <PastVotesPage />
    </VotesContext.Provider>
  );
};

export const Default = Template.bind({});
