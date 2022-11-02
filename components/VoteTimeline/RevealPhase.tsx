import { tabletAndUnder } from "constants/breakpoints";
import { black, red500, white } from "constants/colors";
import { formatDistanceToNowStrict } from "date-fns";
import MobileActiveIndicator from "public/assets/icons/active-phase-indicator.svg";
import Reveal from "public/assets/icons/reveal.svg";
import styled, { CSSProperties } from "styled-components";
import { ActivityStatusT } from "types";

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
  const formattedTimeRemaining = formatDistanceToNowStrict(
    Date.now() + timeRemaining
  );

  return (
    <Wrapper
      style={
        {
          "--color": textColor,
          "--background-color": backgroundColor,
          "--position": isActive ? "relative" : "unset",
        } as CSSProperties
      }
    >
      <RevealIconWrapper>
        <RevealIcon
          style={
            {
              "--stroke-color": iconStrokeColor,
              "--fill-color": iconFillColor,
            } as CSSProperties
          }
        />
      </RevealIconWrapper>
      {isActive ? (
        <Message>
          Time remaining to reveal votes:{" "}
          <Strong>{formattedTimeRemaining}</Strong>
        </Message>
      ) : (
        <Message>
          Reveal phase starts in <Strong>{formattedTimeRemaining}</Strong>
        </Message>
      )}
      {isActive && (
        <MobileActiveIndicatorWrapper>
          <MobileActiveIndicator />
        </MobileActiveIndicatorWrapper>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: var(--position);
  height: 50px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding-left: 60px;
  margin-left: -30px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--background-color);

  @media ${tabletAndUnder} {
    height: unset;
    padding: 15px;
    gap: 10px;
    margin: unset;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const Message = styled.p``;

const RevealIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const RevealIcon = styled(Reveal)`
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
  top: -12px;
  transform: rotate(180deg);

  @media ${tabletAndUnder} {
    display: block;
  }
`;
