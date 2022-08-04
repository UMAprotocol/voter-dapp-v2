import { Banner } from "components/Banner";
import { HowItWorks } from "components/HowItWorks";
import { Layout } from "components/Layout";
import { Votes } from "components/Votes";
import { add, sub } from "date-fns";

export function Overview() {
  const mockVotes = [
    {
      title: "SuperUMAn DAO KPI Options funding proposal 1",
      origin: "UMA" as const,
      description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
          The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
          If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
      voteNumber: 205,
      timestamp: sub(new Date(), { days: 1 }),
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
      isCommitted: false,
      isGovernance: false,
    },
    {
      title: "SuperUMAn DAO KPI Options funding proposal 2",
      origin: "UMA" as const,
      description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
      voteNumber: 205,
      timestamp: sub(new Date(), { days: 1 }),
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
      isCommitted: true,
      isGovernance: false,
    },
    {
      title: "George Kambosos Jr. vs. Devin Haney 3",
      origin: "Polymarket" as const,
      description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
      voteNumber: 205,
      timestamp: sub(new Date(), { days: 1 }),
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
      isCommitted: false,
      isGovernance: false,
    },
    {
      title: "George Kambosos Jr. vs. Devin Haney 4",
      origin: "Polymarket" as const,
      description: `George Kambosos Jr. vs. Devin Haney is an upcoming professional boxing match between undefeated WBA, IBF, WBO lightweight champion George Kambosos Jr., and undefeated WBC lightweight champion Devin Haney. 
      
        The fight will take place on June 5, 2022 at Marvel Stadium in Melbourne, Australia. If George Kambosos Jr. wins this fight, this market will resolve to "Kambosos". If Devin Haney wins this fight, this market will resolve to "Haney". 
        If this fight ends in a tie, is not officially designated as a win for either George Kambosos Jr. or Devin Haney, or otherwise is not decided by June 12, 2022, 11:59:59 PM ET, this market will resolve to 50-50`,
      voteNumber: 205,
      timestamp: sub(new Date(), { days: 1 }),
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
      isCommitted: true,
      isGovernance: false,
    },
  ];

  const mockVoteTimeline = {
    phase: "commit",
    commitPhaseStart: null,
    commitPhaseEnd: add(new Date(), { hours: 23, minutes: 59 }),
    revealPhaseStart: add(new Date(), { hours: 47, minutes: 59 }),
    revealPhaseEnd: null,
  } as const;

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
      <Votes votes={mockVotes} voteTimeline={mockVoteTimeline} />
    </Layout>
  );
}
