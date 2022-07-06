import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add } from "date-fns";
import { DisputeOrigins } from "types/global";

export function Overview() {
  const mockVotes = [
    {
      dispute: {
        title: "SuperUMAn DAO KPI Options funding proposal",
        origin: DisputeOrigins.UMA,
      },
      voteOptions: [
        { label: "Yes", value: "p0", secondaryLabel: "p0" },
        { label: "No", value: "p1", secondaryLabel: "p1" },
        { label: "Unknown", value: "p2", secondaryLabel: "p2" },
        { label: "Early Request", value: "p3", secondaryLabel: "p3" },
      ],
      isCommitted: false,
    },
    {
      dispute: {
        title: "SuperUMAn DAO KPI Options funding proposal",
        origin: DisputeOrigins.UMA,
      },
      voteOptions: [
        { label: "Yes", value: "p0", secondaryLabel: "p0" },
        { label: "No", value: "p1", secondaryLabel: "p1" },
        { label: "Unknown", value: "p2", secondaryLabel: "p2" },
        { label: "Early Request", value: "p3", secondaryLabel: "p3" },
      ],
      isCommitted: true,
    },
    {
      dispute: {
        title: "George Kambosos Jr. vs. Devin Haney",
        origin: DisputeOrigins.Polymarket,
      },
      voteOptions: [
        { label: "Yes", value: "p0", secondaryLabel: "p0" },
        { label: "No", value: "p1", secondaryLabel: "p1" },
        { label: "Unknown", value: "p2", secondaryLabel: "p2" },
        { label: "Early Request", value: "p3", secondaryLabel: "p3" },
      ],
      isCommitted: false,
    },
    {
      dispute: {
        title: "George Kambosos Jr. vs. Devin Haney",
        origin: DisputeOrigins.Polymarket,
      },
      voteOptions: [
        { label: "Yes", value: "p0", secondaryLabel: "p0" },
        { label: "No", value: "p1", secondaryLabel: "p1" },
        { label: "Unknown", value: "p2", secondaryLabel: "p2" },
        { label: "Early Request", value: "p3", secondaryLabel: "p3" },
      ],
      isCommitted: true,
    },
  ];

  const mockVoteTimeline = {
    phase: "commit",
    commitPhaseStart: null,
    commitPhaseEnd: add(new Date(), { hours: 23, minutes: 59 }),
    revealPhaseStart: add(new Date(), { hours: 47, minutes: 59 }),
    revealPhaseEnd: null,
  } as const;

  function mockMoreDetailsAction() {
    console.log("TODO implement more details clicked");
  }

  return (
    <Layout>
      <Banner />
      <HowItWorks />
      <Votes votes={mockVotes} voteTimeline={mockVoteTimeline} moreDetailsAction={mockMoreDetailsAction} />
    </Layout>
  );
}
