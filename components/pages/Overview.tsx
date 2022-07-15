import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add, sub } from "date-fns";
import { DisputeOrigins } from "types/global";

export function Overview() {
  const mockVotes = [
    {
      dispute: {
        title: "SuperUMAn DAO KPI Options funding proposal 1",
        origin: DisputeOrigins.UMA,
        description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
          The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
          If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
        disputeNumber: 205,
        options: [" Devin Haney", "George Kambosos Jr.", "Tie"],
        timestamp: sub(new Date(), { days: 1 }),
        number: 123,
        txid: "0x12345667890987655",
        umipNumber: 456,
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
        title: "SuperUMAn DAO KPI Options funding proposal 2",
        origin: DisputeOrigins.UMA,
        description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
        disputeNumber: 205,
        options: [" Devin Haney", "George Kambosos Jr.", "Tie"],
        timestamp: sub(new Date(), { days: 1 }),
        number: 123,
        txid: "0x12345667890987655",
        umipNumber: 456,
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
        title: "George Kambosos Jr. vs. Devin Haney 3",
        origin: DisputeOrigins.Polymarket,
        description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
        disputeNumber: 205,
        options: [" Devin Haney", "George Kambosos Jr.", "Tie"],
        timestamp: sub(new Date(), { days: 1 }),
        number: 123,
        txid: "0x12345667890987655",
        umipNumber: 456,
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
        title: "George Kambosos Jr. vs. Devin Haney 4",
        origin: DisputeOrigins.Polymarket,
        description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
        disputeNumber: 205,
        options: [" Devin Haney", "George Kambosos Jr.", "Tie"],
        timestamp: sub(new Date(), { days: 1 }),
        number: 123,
        txid: "0x12345667890987655",
        umipNumber: 456,
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

  return (
    <Layout>
      <Banner />
      <HowItWorks />
      <Votes votes={mockVotes} voteTimeline={mockVoteTimeline} />
    </Layout>
  );
}
