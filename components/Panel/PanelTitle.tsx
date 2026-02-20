import { mobileAndUnder } from "constant";
import { usePanelContext } from "hooks";
import LeftChevron from "public/assets/icons/left-chevron.svg";
import styled from "styled-components";
import { VoteOriginT } from "types";

interface Props {
  title: string;
  origin?: VoteOriginT;
  voteNumber?: string;
}
export function PanelTitle({ title, origin, voteNumber }: Props) {
  const { votes, currentIndex, nextVote, prevVote } = usePanelContext();

  const showArrows = votes.length > 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= votes.length - 1;

  return (
    <Wrapper>
      {showArrows && (
        <ArrowButton
          $disabled={isFirst}
          onClick={prevVote}
          disabled={isFirst}
          aria-label="Previous vote"
        >
          <ChevronIcon />
        </ArrowButton>
      )}
      <Header id="panel-title">
        {title}
        <SubTitle>
          <SubTitleText voteNumber={voteNumber} origin={origin} />
        </SubTitle>
      </Header>
      {showArrows && (
        <ArrowButton
          $disabled={isLast}
          onClick={nextVote}
          disabled={isLast}
          aria-label="Next vote"
        >
          <ChevronIcon $flip />
        </ArrowButton>
      )}
    </Wrapper>
  );
}

function SubTitleText({
  voteNumber,
  origin,
}: {
  voteNumber?: string;
  origin?: VoteOriginT;
}) {
  return (
    <>
      {origin && origin} {origin && voteNumber && "|"}{" "}
      {voteNumber && (
        <>
          Vote number <Strong>#{voteNumber}</Strong>
        </>
      )}
    </>
  );
}

const Wrapper = styled.div`
  min-height: var(--header-height);
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 25px;
  overflow: hidden;

  @media ${mobileAndUnder} {
    gap: max(8px, 2%);
    padding-inline: 15px;
  }
`;

const Header = styled.h1`
  font: var(--header-md);
  flex: 1;
  min-width: 0;
`;

const SubTitle = styled.div`
  font: var(--text-sm);
`;

const ArrowButton = styled.button<{ $disabled: boolean }>`
  background: none;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
  padding: 8px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 200ms;
`;

const ChevronIcon = styled(LeftChevron)<{ $flip?: boolean }>`
  width: 10px;
  height: 20px;
  transform: ${({ $flip }) => ($flip ? "scaleX(-1)" : "none")};
  path {
    stroke: var(--white);
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;
