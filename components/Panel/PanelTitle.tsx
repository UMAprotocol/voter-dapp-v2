import styled from "styled-components";
import { VoteOriginT } from "types/global";
import UMA from "public/assets/icons/uma.svg";
import Polymarket from "public/assets/icons/polymarket.svg";

interface Props {
  title: string;
  origin?: VoteOriginT;
  voteNumber?: number;
}
export function PanelTitle({ title, origin, voteNumber }: Props) {
  return (
    <Wrapper>
      <TitleIcon origin={origin} />
      <Header id="panel-title">
        {title}
        <SubTitle>
          <SubTitleText voteNumber={voteNumber} origin={origin} />
        </SubTitle>
      </Header>
    </Wrapper>
  );
}

function TitleIcon({ origin }: { origin?: VoteOriginT }) {
  switch (origin) {
    case "UMA":
      return (
        <TitleIconWrapper>
          <UMAIcon />
        </TitleIconWrapper>
      );
    case "Polymarket":
      return (
        <TitleIconWrapper>
          <PolymarketIcon />
        </TitleIconWrapper>
      );
    default:
      return null;
  }
}

function SubTitleText({ voteNumber, origin }: { voteNumber?: number; origin?: VoteOriginT }) {
  if (!voteNumber || !origin) return null;

  return (
    <>
      {origin} | Vote number <strong>#{voteNumber}</strong>
    </>
  );
}

const Wrapper = styled.div`
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  padding: 25px;
`;

const Header = styled.h1`
  font: var(--header-md);
  margin-right: 30px;
  max-width: 80%;
`;

const SubTitle = styled.div`
  font: var(--text-sm);
`;

const UMAIcon = styled(UMA)``;

const PolymarketIcon = styled(Polymarket)``;

const TitleIconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;
