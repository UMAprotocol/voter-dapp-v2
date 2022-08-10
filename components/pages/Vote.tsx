import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add, sub } from "date-fns";
import useActiveVotes from "hooks/useActiveVotes";
import { useContractsContext } from "hooks/useContractsContext";

export function Vote() {
  const { voting } = useContractsContext();
  const { activeVotes } = useActiveVotes(voting);

  const mockStakeholderData = {
    stakedBalance: 123.456,
    unstakedBalance: 123.456,
    claimableRewards: 500,
    cooldownEnds: add(new Date(), { hours: 23, minutes: 59 }),
    votesInLastCycles: 3,
    apy: 18,
  };

  function makeMockVotes() {
    if (!activeVotes) return null;
    return activeVotes.map(
      ({ identifier, decodedIdentifier, ancillaryData, decodedAncillaryData, time, timeMilliseconds }, i) => ({
        identifier,
        ancillaryData,
        decodedIdentifier,
        decodedAncillaryData,
        time,
        timeMilliseconds,
        title: decodedIdentifier,
        origin: i % 2 === 0 ? ("UMA" as const) : ("Polymarket" as const),
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
          { label: "Yes", value: "0", secondaryLabel: "p0" },
          { label: "No", value: "1", secondaryLabel: "p1" },
          { label: "Unknown", value: "2", secondaryLabel: "p2" },
          { label: "Early Request", value: "3", secondaryLabel: "p3" },
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
        isCommitted: i % 2 === 0,
        isRevealed: i % 2 === 0,
        isGovernance: i % 2 === 0,
      })
    );
  }

  const votes = makeMockVotes();

  return (
    <Layout>
      <Banner />
      <HowItWorks {...mockStakeholderData} />
      {votes && <Votes votes={votes} />}
    </Layout>
  );
}
