import { black, red500, tabletAndUnder, white } from "constant";
import { formatDistanceToNowStrict } from "date-fns";
import { config } from "helpers";
import { usePanelContext } from "hooks";
import MobileActiveIndicator from "public/assets/icons/active-phase-indicator.svg";
import Reveal from "public/assets/icons/reveal.svg";
import styled, { CSSProperties } from "styled-components";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
}
export function RevealPhase({ phase, timeRemaining }: Props) {
  const { openPanel } = usePanelContext();
  const isRevealPhase = phase === "reveal";
  const isActive = isRevealPhase;
  const textColor = isActive ? white : black;
  const backgroundColor = isActive ? red500 : white;
  const iconStrokeColor = isActive ? red500 : white;
  const iconFillColor = isActive ? white : black;
  const remindMeButtonTextColor = isActive ? white : red500;
  const formattedTimeRemaining = formatDistanceToNowStrict(
    Date.now() + timeRemaining
  );
  const hasMailchimpUrl = config.mailchimpUrl !== undefined;

  return (
    <Wrapper
      style={
        {
          "--color": textColor,
          "--background-color": backgroundColor,
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
          Reveal phase starts in: <Strong>{formattedTimeRemaining}</Strong>
        </Message>
      )}
      {hasMailchimpUrl && (
        <RemindMeButton
          onClick={() => openPanel("remind")}
          style={
            {
              "--color": remindMeButtonTextColor,
            } as CSSProperties
          }
        >
          Remind me
        </RemindMeButton>
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
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding-left: 60px;
  margin-left: -30px;
  font: var(--text-md);
  color: var(--color);
  background-color: var(--background-color);
  border-radius: 5px;

  @media ${tabletAndUnder} {
    height: unset;
    padding: 15px;
    gap: 10px;
    margin: unset;
    border-radius: 0;
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
  z-index: 1;
  display: none;
  position: absolute;
  left: 15px;
  top: -12px;
  transform: rotate(180deg);

  @media ${tabletAndUnder} {
    display: block;
  }
`;

const RemindMeButton = styled.button`
  background: transparent;
  margin-left: auto;
  margin-right: 1.5vw;
  color: var(--color);
  @media ${tabletAndUnder} {
    display: none;
  }
`;
