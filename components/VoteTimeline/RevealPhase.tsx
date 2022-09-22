import { black, red500, white } from "constants/colors";
import { formatDistanceToNowStrict } from "date-fns";
import Reveal from "public/assets/icons/reveal.svg";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT } from "types/global";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
  status: ActivityStatusT;
}
export function RevealPhase({ phase, timeRemaining, status }: Props) {
  const isRevealPhase = phase === "reveal";
  const isActive = isRevealPhase && status === "active";
  const textColor = isActive ? white : black;
  const backgroundColor = isActive ? red500 : white;
  const iconStrokeColor = isActive ? red500 : white;
  const iconFillColor = isActive ? white : black;
  const formattedTimeRemaining = formatDistanceToNowStrict(Date.now() + timeRemaining);

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
