import { Tabs } from "components";
import { mobileAndUnder } from "constant";
import { useVoteTimingContext } from "hooks";
import styled from "styled-components";
import { RollResultT, VoteT } from "types";
import { PanelSectionText } from "../styles";
import { Result } from "./Result";

export function getPastRolls(
  resultsPerRoll: RollResultT[] | undefined,
  currentRoundId: number
) {
  return resultsPerRoll?.filter((roll) => roll.roundId < currentRoundId) ?? [];
}

interface Props {
  content: VoteT;
  proposedPrice: string | undefined;
}

// Shows one sub-tab of results per roll for votes that have rolled to a new
// voting round without resolving. Sub-tabs are labelled "Roll #0", "Roll #1",
// ... in the order the rounds were voted on. The current roll only gets a
// sub-tab once its results are visible, ie during the reveal phase.
export function RollResults({ content, proposedPrice }: Props) {
  const { roundId: currentRoundId, phase } = useVoteTimingContext();
  const { resultsPerRoll, decodedIdentifier, options } = content;

  const pastRolls = getPastRolls(resultsPerRoll, currentRoundId);
  const currentRoll = resultsPerRoll?.find(
    (roll) => roll.roundId === currentRoundId
  );

  function makeRollContent(roll: RollResultT | undefined) {
    if (!roll?.results.length) {
      return (
        <NoResultsMessage>
          No votes have been revealed in this roll.
        </NoResultsMessage>
      );
    }
    return (
      <Result
        decodedIdentifier={decodedIdentifier}
        participation={roll.participation}
        results={roll.results}
        options={options}
        proposedPrice={proposedPrice}
      />
    );
  }

  const tabs = pastRolls.map((roll, index) => ({
    title: `Roll #${index}`,
    content: makeRollContent(roll),
  }));

  // votes revealed in the current roll are only visible during the reveal phase
  if (phase === "reveal") {
    tabs.push({
      title: `Roll #${pastRolls.length}`,
      content: makeRollContent(currentRoll),
    });
  }

  return (
    <Wrapper>
      <Tabs tabs={tabs} defaultValue={tabs[tabs.length - 1]?.title} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 10px;

  [role="tablist"] {
    height: 35px;
    gap: 30px;
    background: transparent;
    border-bottom: 1px solid var(--grey-100);

    @media ${mobileAndUnder} {
      gap: 15px;
    }
  }
`;

const NoResultsMessage = styled(PanelSectionText)`
  margin-top: 20px;
  padding-inline: 30px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;
