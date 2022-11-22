import {
  computeColors,
  computePercentages,
  DonutChart,
  PanelErrorBanner,
  Tooltip,
} from "components";
import { mobileAndUnder } from "constant";
import { formatVoteStringWithPrecision } from "helpers";
import { usePanelWidth } from "hooks";
import Portion from "public/assets/icons/portion.svg";
import Voting from "public/assets/icons/voting.svg";
import styled, { CSSProperties } from "styled-components";
import { DropdownItemT, ParticipationT, ResultsT } from "types";
import { PanelSectionText, PanelSectionTitle } from "../styles";

interface Props {
  participation: ParticipationT | undefined;
  results: ResultsT | undefined;
  options: DropdownItemT[] | undefined;
  decodedIdentifier: string;
}
export function Result({
  participation,
  results,
  options,
  decodedIdentifier,
}: Props) {
  const panelWidth = usePanelWidth();

  if (!participation || !results) return null;

  const { uniqueCommitAddresses, uniqueRevealAddresses, totalTokensVotedWith } =
    participation;

  const resultsWithLabels = results.map(({ vote, tokensVotedWith }) => {
    const voteAsString = vote.toFixed();
    const formatted = formatVoteStringWithPrecision(
      voteAsString,
      decodedIdentifier
    );
    const label = findVoteInOptions(formatted)?.label ?? formatted;
    const value = tokensVotedWith;

    return {
      label,
      value,
    };
  });
  const resultsWithPercentages = computePercentages(resultsWithLabels);
  const resultsWithColors = computeColors(resultsWithPercentages);

  function findVoteInOptions(value: string | undefined) {
    return options?.find((option) => {
      return option.value === value;
    });
  }

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
            <DonutChart
              data={resultsWithLabels}
              size={panelWidth / 3}
              hole={panelWidth / 3 - 30}
            />
          </Chart>
          <Legend>
            {resultsWithColors.map(({ label, value, percent, color }) => (
              <LegendItem key={label}>
                <LegendItemDot style={{ "--color": color } as CSSProperties} />
                <LegendItemData>
                  <LegendItemLabel label={label} />
                  <Strong>{(percent * 100).toFixed(2)}%</Strong> ({value})
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
        <ParticipationItem>
          <span>Unique commit addresses</span>
          <Strong>{uniqueCommitAddresses}</Strong>
        </ParticipationItem>
        <ParticipationItem>
          <span>Unique reveal addresses</span>
          <Strong>{uniqueRevealAddresses}</Strong>
        </ParticipationItem>
        <ParticipationItem>
          <span>Total tokens voted with</span>
          <Strong>{totalTokensVotedWith}</Strong>
        </ParticipationItem>
      </SectionWrapper>
      <PanelErrorBanner errorOrigin="vote" />
    </Wrapper>
  );
}

function LegendItemLabel({ label }: { label: string }) {
  if (label.length > 10) {
    return (
      <Tooltip label={label}>
        <LegendItemLabelWrapper>{label.slice(0, 10)}...</LegendItemLabelWrapper>
      </Tooltip>
    );
  }
  return <LegendItemLabelWrapper>{label}</LegendItemLabelWrapper>;
}

const Wrapper = styled.div`
  margin-top: 20px;
  padding-inline: 30px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
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

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const ResultSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10%;
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

const LegendItemLabelWrapper = styled.h3`
  font-weight: 500;
`;

const LegendItemData = styled.div`
  font: var(--text-md);

  @media ${mobileAndUnder} {
    font: var(--text-sm);
  }
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
