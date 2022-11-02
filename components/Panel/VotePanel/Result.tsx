import {
  computeColors,
  computePercentages,
  DonutChart,
  PanelErrorBanner,
} from "components";
import Portion from "public/assets/icons/portion.svg";
import Voting from "public/assets/icons/voting.svg";
import styled, { CSSProperties } from "styled-components";
import { VoteResultT } from "types";
import { PanelSectionText, PanelSectionTitle } from "../styles";

export function Result({ participation, results }: VoteResultT) {
  if (!participation || !results) return null;

  const resultsWithPercentages = computePercentages(results);
  const resultsWithColors = computeColors(resultsWithPercentages);

  return (
    <Wrapper>
      <PanelSectionTitle>
        <IconWrapper>
          <PortionIcon />
        </IconWrapper>
        Result
      </PanelSectionTitle>
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
                  <Strong>{percent.toFixed(2)}%</Strong> ({value})
                </LegendItemData>
              </LegendItem>
            ))}
          </Legend>
        </ResultSectionWrapper>
      </SectionWrapper>
      <PanelSectionTitle>
        <IconWrapper>
          <VotingIcon />
        </IconWrapper>
        Participation
      </PanelSectionTitle>
      <SectionWrapper>
        {participation.map(({ label, value }) => (
          <ParticipationItem key={label}>
            <span>{label}</span>
            <Strong>{value}</Strong>
          </ParticipationItem>
        ))}
      </SectionWrapper>
      <PanelErrorBanner errorOrigin="vote" />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;
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

const ParticipationItem = styled(PanelSectionText)`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;
