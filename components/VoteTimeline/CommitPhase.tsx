import { black, red500, tabletAndUnder, white } from "constant";
import { formatDistanceToNowStrict } from "date-fns";
import MobileActiveIndicator from "public/assets/icons/active-phase-indicator.svg";
import Commit from "public/assets/icons/commit.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
}
export function CommitPhase({ phase, timeRemaining }: Props) {
  const isCommitPhase = phase === "commit";
  const isActive = isCommitPhase;
  const textColor = isActive ? white : black;
  const backgroundColor = isActive ? red500 : white;
  const iconStrokeColor = isActive ? red500 : white;
  const iconFillColor = isActive ? white : black;
  const formattedTimeRemaining = formatDistanceToNowStrict(
    Date.now() + timeRemaining
  );

  let message = (
    <Message>
      Commit phase starts in: <Strong>{formattedTimeRemaining}</Strong>
    </Message>
  );
  if (phase === "commit") {
    message = (
      <Message>
        Time remaining to commit votes:{" "}
        <Strong>{formattedTimeRemaining}</Strong>
      </Message>
    );
  } else if (phase === "reveal") {
    message = <Message>Commit phase over</Message>;
  }

  return (
    <OuterWrapper>
      <InnerWrapper
        style={
          {
            "--color": textColor,
            "--background-color": backgroundColor,
          } as CSSProperties
        }
      >
        <CommitIconWrapper>
          <CommitIcon
            style={
              {
                "--stroke-color": iconStrokeColor,
                "--fill-color": iconFillColor,
              } as CSSProperties
            }
          />
        </CommitIconWrapper>
        {message}
      </InnerWrapper>
      {isActive && (
        <MobileActiveIndicatorWrapper>
          <MobileActiveIndicator />
        </MobileActiveIndicatorWrapper>
      )}
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  position: relative;
  z-index: 1;

  @media ${tabletAndUnder} {
    border-bottom: 1px solid var(--border-color);
  }
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
  border-radius: 5px;

  @media ${tabletAndUnder} {
    height: unset;
    gap: 10px;
    padding: 15px;
    clip-path: unset;
    border-radius: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
`;

const Message = styled.p``;

const CommitIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const CommitIcon = styled(Commit)`
  * {
    stroke: var(--stroke-color);
    fill: var(--fill-color);
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const MobileActiveIndicatorWrapper = styled.div`
  display: none;
  position: absolute;
  left: 15px;
  bottom: -12px;

  @media ${tabletAndUnder} {
    display: block;
  }
`;
