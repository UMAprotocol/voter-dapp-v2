import { black, red500, white } from "constants/colors";
import { phaseLength } from "constants/voteTiming";
import { formatDistanceToNowStrict } from "date-fns";
import Reveal from "public/assets/icons/reveal.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
  isUpcoming: boolean;
}
export function RevealPhase({ phase, timeRemaining, isUpcoming }: Props) {
  const isRevealPhase = phase === "reveal";
  const isActive = isRevealPhase && !isUpcoming;
  const textColor = isActive ? white : black;
  const backgroundColor = isActive ? red500 : white;
  const iconStrokeColor = isActive ? red500 : white;
  const iconFillColor = isActive ? white : black;
  const formattedTimeRemaining = formatDistanceToNowStrict(Date.now() + determineTimeRemaining());

  function determineTimeRemaining() {
    // if the vote is upcoming and we are in the reveal phase, we need to add the time remaining for the current reveal phase, the commit phase, and the next reveal phase
    if (isUpcoming && isRevealPhase) return timeRemaining + phaseLength * 1000 * 3;
    // if the vote is upcoming and we are in the commit phase, we need to add the time remaining for the commit phase and the reveal phase
    if (isUpcoming && !isRevealPhase) return timeRemaining + phaseLength * 1000 * 2;
    // if the vote is not upcoming, we just need to add the time remaining
    return timeRemaining;
  }

  return (
    <Wrapper
      style={
        {
          "--color": textColor,
          "--background-color": backgroundColor,
        } as CSSProperties
      }
    >
      <RevealIcon
        style={
          {
            "--stroke-color": iconStrokeColor,
            "--fill-color": iconFillColor,
          } as CSSProperties
        }
      />
      {isActive ? (
        <Message>
          Time remaining to reveal votes: <Strong>{formattedTimeRemaining}</Strong>
        </Message>
      ) : (
        <Message>
          Reveal phase starts in <Strong>{formattedTimeRemaining}</Strong>
        </Message>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding-left: 60px;
  margin-left: -30px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--background-color);
`;

const Message = styled.p``;

const RevealIcon = styled(Reveal)`
  * {
    stroke: var(--stroke-color);
    fill: var(--fill-color);
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;
