import {
  computeColors,
  computePercentages,
  DonutChart,
  PanelErrorBanner,
  Tooltip,
} from "components";
import { ProgressBar } from "components/ProgressBar/ProgressBar";
import { mobileAndUnder, isEarlyVote } from "constant";
import {
  formatVoteStringWithPrecision,
  truncateDecimals,
  commify,
  addOpacityToHsl,
  formatToSignificantThousand,
} from "helpers";
import { NonNullablePick } from "helpers";
import { usePanelWidth } from "hooks";
import Portion from "public/assets/icons/portion.svg";
import Success from "public/assets/icons/success.svg";
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

  const {
    uniqueCommitAddresses,
    uniqueRevealAddresses,
    totalTokensVotedWith,
    totalTokensCommitted,
  } = participation;

  const resultsWithLabels = results.map(({ vote, tokensVotedWith }) => {
    const formatted = formatVoteStringWithPrecision(vote, decodedIdentifier);
    const label =
      findVoteInOptionsDetectEarlyVote(formatted)?.label ?? formatted;
    const value = tokensVotedWith;

    return {
      label,
      value,
    };
  });
  const resultsWithPercentages = computePercentages(resultsWithLabels);
  const resultsWithColors = computeColors(resultsWithPercentages);

  const quorumData =
    participation.minAgreementRequirement &&
    participation.minParticipationRequirement
      ? {
          totalTokensVotedWith,
          resultsWithColors,
          minAgreementRequirement: participation.minAgreementRequirement,
          minParticipationRequirement:
            participation.minParticipationRequirement,
        }
      : undefined;

  function findVoteInOptions(value: string | undefined) {
    return options?.find((option) => {
      return option.value === value;
    });
  }
  function findVoteInOptionsDetectEarlyVote(value: string | undefined) {
    if (isEarlyVote(value)) return { label: "Early request" };
    return findVoteInOptions(value);
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
                  <Strong>{(percent * 100).toFixed(2)}%</Strong> (
                  {value ? commify(truncateDecimals(value, 2)) : 0})
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
        <QuorumProgress quorumData={quorumData} />
        <ParticipationItem>
          <span>Unique commit addresses</span>
          <Strong>{uniqueCommitAddresses}</Strong>
        </ParticipationItem>
        <ParticipationItem>
          <span>Unique reveal addresses</span>
          <Strong>{uniqueRevealAddresses}</Strong>
        </ParticipationItem>
        <ParticipationItem>
          <span>Total tokens that committed</span>
          <Strong>
            {totalTokensCommitted
              ? commify(truncateDecimals(totalTokensCommitted, 2))
              : 0}
          </Strong>
        </ParticipationItem>
        {totalTokensCommitted && (
          <ParticipationItem>
            <span>Total tokens that revealed</span>
            <Strong>
              <Span>
                (
                {((totalTokensVotedWith / totalTokensCommitted) * 100).toFixed(
                  2
                )}
                %)
              </Span>
              {totalTokensVotedWith
                ? commify(truncateDecimals(totalTokensVotedWith, 2))
                : 0}
            </Strong>
          </ParticipationItem>
        )}
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

type QuorumData = {
  quorumData:
    | ({
        resultsWithColors: ReturnType<typeof computeColors>;
      } & NonNullablePick<
        ParticipationT,
        | "totalTokensVotedWith"
        | "minAgreementRequirement"
        | "minParticipationRequirement"
      >)
    | undefined;
};

function QuorumProgress({ quorumData }: QuorumData) {
  if (!quorumData) {
    return null;
  }

  const winningVote = quorumData.resultsWithColors.reduce(
    (max, obj) => (obj.value > max.value ? obj : max),
    quorumData.resultsWithColors[0]
  );

  const quorumRate =
    quorumData.totalTokensVotedWith / quorumData.minParticipationRequirement;

  const quorumRequirementMet = quorumRate > 1;

  const consensusRate = winningVote.value / quorumData.minAgreementRequirement;

  const consensusRequirementMet = consensusRate > 1;

  const quorumTooltip = `The minimum amount of tokens that must vote for a dispute to be finalized (${formatToSignificantThousand(
    quorumData.minParticipationRequirement
  )}).`;

  const consensusTooltip = `At least ${formatToSignificantThousand(
    quorumData.minAgreementRequirement
  )} tokens must vote in favor of one option for a dispute to be finalized. This ensures that the required majority is achieved.`;

  return (
    <ParticipationItem>
      <div className="mt-2 flex w-full flex-col gap-2">
        <Tooltip label={quorumTooltip}>
          <QuorumItem>
            <span>
              Quorum ({`${(Math.min(quorumRate, 1) * 100).toFixed(0)}%`})
            </span>
            {quorumRequirementMet && <SuccessIcon />}
            <span className="ml-auto">
              {formatToSignificantThousand(quorumData.totalTokensVotedWith)} /{" "}
              {formatToSignificantThousand(
                quorumData.minParticipationRequirement
              )}
            </span>
          </QuorumItem>
        </Tooltip>

        <ProgressBar
          progress={Math.min(quorumRate, 1)}
          secondaryColor={addOpacityToHsl(winningVote.color, 0.2)}
          primaryColor={winningVote.color}
        />
        <Tooltip label={consensusTooltip}>
          <QuorumItem>
            <span>
              Consensus ({`${(Math.min(consensusRate, 1) * 100).toFixed(0)}%`})
            </span>
            {consensusRequirementMet && <SuccessIcon />}
            <span className="ml-auto">
              {formatToSignificantThousand(winningVote.value)} /
              {formatToSignificantThousand(quorumData.minAgreementRequirement)}
            </span>
          </QuorumItem>
        </Tooltip>

        <ProgressBar
          progress={Math.min(consensusRate, 1)}
          secondaryColor={addOpacityToHsl(winningVote.color, 0.2)}
          primaryColor={winningVote.color}
        />
      </div>
    </ParticipationItem>
  );
}

const SuccessIcon = styled(Success)`
  width: 14px;
  display: inline;
`;

const QuorumItem = styled.div`
  font: var(--text-sm);
  display: flex;
  justify-content: start;
  gap: 8px;
  align-items: center;
`;

const Span = styled.span`
  color: var(--red-500);
  margin-inline: 1em;
`;

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
  aspect-ratio: 1/1;
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
