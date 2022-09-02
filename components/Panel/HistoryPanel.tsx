import { black, green, red500 } from "constants/colors";
import { CSSProperties } from "styled-components";
import { PanelTitle } from "./PanelTitle";
import { PanelWrapper } from "./styles";

export function HistoryPanel() {
  const apy = "21,3%";
  const participationScore = 120;
  const bonusOrPenalty = -7.5;
  const bonusPenaltyHighlightColor = bonusOrPenalty === 0 ? black : bonusOrPenalty > 0 ? green : red500;
  return (
    <PanelWrapper>
      <PanelTitle title="History" />
      <ApyWrapper>
        <ApyHeader>Your return</ApyHeader>
        <Apy>{apy}</Apy>
        <ApyDetailsWrapper>
          <Text>Based on participation score = {participationScore}</Text>
          <Text>
            Your bonus/penalty ={" "}
            <BonusOrPenalty
              style={
                {
                  "--color": bonusPenaltyHighlightColor,
                } as CSSProperties
              }
            >
              {bonusOrPenalty}
            </BonusOrPenalty>
          </Text>
        </ApyDetailsWrapper>
      </ApyWrapper>
    </PanelWrapper>
  );
}
