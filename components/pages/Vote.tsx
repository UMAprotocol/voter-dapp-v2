import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add, sub } from "date-fns";
import { ethers } from "ethers";

export function Vote() {
  function makeMockVotes() {
    const mockVotes = Array.from({ length: 5 });
    return mockVotes.map((_, i) => ({
      identifier: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`vote-${i}`)),
      ancillaryData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`ancillary-${i}`)),
      decodedIdentifier: "vote-" + i,
      decodedAncillaryData: "ancillary-" + i,
      time: 1659700922602 / 1000,
      timeMilliseconds: 1659700922602,
      title: "Mock vote number: " + i,
      origin: Math.random() > 0.5 ? ("UMA" as const) : ("Polymarket" as const),
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      voteNumber: 100 + i,
      timestamp: sub(new Date(), { days: 1 }),
      txid: "0x12345667890987655" + i,
      umipNumber: 200 + i,
      links: [
        {
          label: "UMIP link",
          href: "https://www.todo.com",
        },
        {
          label: "Dispute txid",
          href: "https://www.todo.com",
        },
        {
          label: "Optimistic Oracle UI",
          href: "https://www.todo.com",
        },
      ],
      discordLink: "https://www.todo.com",
      options: [
        { label: "Yes", value: "p0", secondaryLabel: "p0" },
        { label: "No", value: "p1", secondaryLabel: "p1" },
        { label: "Unknown", value: "p2", secondaryLabel: "p2" },
        { label: "Early Request", value: "p3", secondaryLabel: "p3" },
      ],
      participation: [
        { label: "Total Votes", value: 188077355.982231 },
        { label: "Unique Commit Addresses", value: 100 },
        { label: "Unique Reveal Addresses", value: 97 },
      ],
      results: [
        {
          label: "Devin Haney",
          value: 1234,
        },
        {
          label: "George Washington",
          value: 5678,
        },
        {
          label: "Tie",
          value: 500,
        },
        {
          label: "Early Expiry",
          value: 199,
        },
      ],
      isCommitted: Math.random() > 0.5,
      isGovernance: Math.random() > 0.5,
    }));
  }

  const mockVotes = makeMockVotes();

  const mockStakeholderData = {
    stakedBalance: 123.456,
    unstakedBalance: 123.456,
    claimableRewards: 500,
    cooldownEnds: add(new Date(), { hours: 23, minutes: 59 }),
    votesInLastCycles: 3,
    apy: 18,
  };

  return (
    <Layout>
      <Banner />
      <HowItWorks {...mockStakeholderData} />
      <Votes votes={mockVotes} />
    </Layout>
  );
}
