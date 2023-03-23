import { phaseLengthMilliseconds, tabletAndUnder } from "constant";
import { formatDistanceToNowStrict } from "date-fns";
import { usePanelContext } from "hooks";
import Commit from "public/assets/icons/commit.svg";
import styled from "styled-components";

interface Props {
  phase: "commit" | "reveal";
  timeRemaining: number;
}

export function NextRoundStartsIn({ phase, timeRemaining }: Props) {
  const { openPanel } = usePanelContext();

  const millisecondsUntilRoundEnds =
    phase === "commit"
      ? timeRemaining + phaseLengthMilliseconds
      : timeRemaining;
  const formattedTimeRemaining = formatDistanceToNowStrict(
    Date.now() + millisecondsUntilRoundEnds
  );

  return (
    <Wrapper>
      <CommitIconWrapper>
        <CommitIcon />
      </CommitIconWrapper>
      <Message>
        Next voting round starts in: <Strong>{formattedTimeRemaining}</Strong>
      </Message>
      <RemindMeButton onClick={() => openPanel("remind")}>
        Remind me
      </RemindMeButton>
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
  color: var(--black);
  background-color: var(--white);
  border-radius: 5px;

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
    stroke: var(--white);
    fill: var(--black);
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;

const RemindMeButton = styled.button`
  background: transparent;
  margin-left: auto;
  margin-right: 1.5vw;
  color: var(--red-500);
  @media ${tabletAndUnder} {
    display: none;
  }
`;
