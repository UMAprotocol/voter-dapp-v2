import { black, red, white } from "constants/colors";
import Reveal from "public/assets/icons/reveal.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  active: boolean;
  startsIn: string | null;
  timeRemaining: string | null;
}
export function RevealPhase({ active, startsIn, timeRemaining }: Props) {
  const textColor = active ? white : black;
  const backgroundColor = active ? red : white;
  const iconStrokeColor = active ? red : white;
  const iconFillColor = active ? white : black;
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
      {startsIn ? (
        <Message>
          Reveal phase starts in <strong>{startsIn}</strong>
        </Message>
      ) : timeRemaining ? (
        <Message>
          Time remaining to reveal votes: <strong>{timeRemaining}</strong>
        </Message>
      ) : (
        <Message>Reveal phase over</Message>
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
