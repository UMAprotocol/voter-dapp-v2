import { tabletAndUnder } from "constants/breakpoints";
import { black, red500, white } from "constant";
import { formatDistanceToNowStrict } from "date-fns";
import MobileActiveIndicator from "public/assets/icons/active-phase-indicator.svg";
import Commit from "public/assets/icons/commit.svg";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT } from "types";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
  status: ActivityStatusT;
}
export function CommitPhase({ phase, timeRemaining, status }: Props) {
  const isCommitPhase = phase === "commit";
  const isActive = isCommitPhase && status === "active";
  const textColor = isActive ? white : black;
  const backgroundColor = isActive ? red500 : white;
  const iconStrokeColor = isActive ? red500 : white;
  const iconFillColor = isActive ? white : black;
  const formattedTimeRemaining = formatDistanceToNowStrict(
    
    Date.now() + timeRemaining
  
  );

  return (
    <OuterWrapper
      style={
        {
          "--position": isActive ? "relative" : "unset",
        } as CSSProperties
      }
    >
      {status !== "active" && <ArrowBorder />}
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
        {isActive ? (
          <Message>
            Time remaining to commit votes:{" "}
           {" "}
            <Strong>{formattedTimeRemaining}</Strong>
          </Message>
        ) : (
          <Message>
            Commit phase starts in <Strong>{formattedTimeRemaining}</Strong>
          </Message>
        )}
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
  position: var(--position);
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

  @media ${tabletAndUnder} {
    height: unset;
    gap: 10px;
    padding: 15px;
    clip-path: unset;
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

// we can't have a border with a clip path,
// so instead we create a separate element with the desired border as a background color,
// and shift it over a bit to the right
const ArrowBorder = styled.div`
  position: absolute;
  height: 50px;
  width: 100%;
  clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0 100%, 0 0);
  background-color: var(--black);
  top: 0;
  left: 2px;

  @media ${tabletAndUnder} {
    display: none;
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
