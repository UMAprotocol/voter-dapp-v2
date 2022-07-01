import { black, red, white } from "constants/colors";
import Commit from "public/assets/icons/commit.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  active: boolean;
  startsIn: string | null;
  timeRemaining: string | null;
}
export function CommitPhase({ active, startsIn, timeRemaining }: Props) {
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
      <CommitIcon
        style={
          {
            "--stroke-color": iconStrokeColor,
            "--fill-color": iconFillColor,
          } as CSSProperties
        }
      />
      {startsIn ? (
        <Message>
          Commit phase starts in <strong>{startsIn}</strong>
        </Message>
      ) : timeRemaining ? (
        <Message>
          Time remaining to commit votes: <strong>{timeRemaining}</strong>
        </Message>
      ) : (
        <Message>Commit phase over</Message>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding-left: 10px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--background-color);
`;
const Message = styled.p``;
const CommitIcon = styled(Commit)`
  * {
    stroke: var(--stroke-color);
    fill: var(--fill-color);
  }
`;
