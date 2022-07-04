import { black, red, white } from "constants/colors";
import Commit from "public/assets/icons/commit.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  phase: "commit" | "reveal" | null;
  startsIn: string | null;
  timeRemaining: string | null;
}
export function CommitPhase({ phase, startsIn, timeRemaining }: Props) {
  const active = phase === "commit";
  const textColor = active ? white : black;
  const backgroundColor = active ? red : white;
  const iconStrokeColor = active ? red : white;
  const iconFillColor = active ? white : black;
  return (
    <OuterWrapper>
      {!phase && <ArrowBorder />}
      <InnerWrapper
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
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  position: relative;
`;

const InnerWrapper = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding-left: 10px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--background-color);
  clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0 100%, 0 0);
`;

const Message = styled.p``;

const CommitIcon = styled(Commit)`
  * {
    stroke: var(--stroke-color);
    fill: var(--fill-color);
  }
`;

// we can't have a border with a clip path,
// so instead we create a separate element with the desired border as a background color,
// and shift it over a bit to the right
const ArrowBorder = styled.div`
  position: absolute;
  height: 50px;
  width: 100%;
  clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0 100%, 0 0);
  background-color: var(--gray-100);
  top: 0;
  left: 2px;
`;
