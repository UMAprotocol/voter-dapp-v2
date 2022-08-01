import styled, { CSSProperties } from "styled-components";
import Portion from "public/assets/icons/portion.svg";
import Voting from "public/assets/icons/voting.svg";
import { DonutChart } from "components/DonutChart";
import { computePercentages, computeColors } from "components/DonutChart/helpers";

export function Result() {
  // todo wire up to graph
  const participationItems = [
    { label: "Total Votes", value: "188,077,355.982231" },
    { label: "Unique Commit Addresses", value: "100" },
    { label: "Unique Reveal Addresses", value: "97" },
  ];

  // todo wire up to graph
  const results = [
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
  ];

  const resultsWithPercentages = computePercentages(results);
  const resultsWithColors = computeColors(resultsWithPercentages);

  return (
    <Wrapper>
      <Title>
        <IconWrapper>
          <PortionIcon />
        </IconWrapper>
        Result
      </Title>
      <SectionWrapper>
        <ResultSectionWrapper>
          <Chart>
            <DonutChart data={results} />
          </Chart>
          <Legend>
            {resultsWithColors.map(({ label, value, percent, color }) => (
              <LegendItem key={label}>
                <LegendItemDot style={{ "--color": color } as CSSProperties} />
                <LegendItemData>
                  <LegendItemLabel>{label}</LegendItemLabel>
                  <strong>{percent.toFixed(2)}%</strong> ({value})
                </LegendItemData>
              </LegendItem>
            ))}
          </Legend>
        </ResultSectionWrapper>
      </SectionWrapper>
      <Title>
        <IconWrapper>
          <VotingIcon />
        </IconWrapper>
        Participation
      </Title>
      <SectionWrapper>
        {participationItems.map(({ label, value }) => (
          <ParticipationItem key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </ParticipationItem>
        ))}
      </SectionWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
`;

const Title = styled.h2`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
  margin-bottom: 15px;
  font: var(--header-sm);
  font-weight: 700;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const SectionWrapper = styled.div`
  padding-block: 25px;
  padding-left: 20px;
  padding-right: 12px;
  margin-bottom: 30px;
  background: var(--grey-50);
  border-radius: 5px;
`;

const ResultSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
`;

const Chart = styled.div``;

const Legend = styled.ul`
  list-style: none;
`;

const LegendItem = styled.li`
  display: flex;
  gap: 11px;
  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

const LegendItemDot = styled.div`
  width: 15px;
  height: 15px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--color);
`;

const LegendItemLabel = styled.h3`
  font-weight: 500;
`;

const LegendItemData = styled.div`
  font: var(--text-md);
`;

const VotingIcon = styled(Voting)`
  fill: var(--red-500);
`;

const PortionIcon = styled(Portion)`
  fill: var(--red-500);
`;

const ParticipationItem = styled.p`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: var(--text-md);

  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;
