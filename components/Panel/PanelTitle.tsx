import { mobileAndUnder } from "constant";
import Across from "public/assets/icons/across.svg";
import Polymarket from "public/assets/icons/polymarket.svg";
import OSnap from "public/assets/icons/osnap.svg";
import UMAGovernance from "public/assets/icons/uma-governance.svg";
import UMA from "public/assets/icons/uma.svg";
import styled from "styled-components";
import { VoteOriginT } from "types";

interface Props {
  title: string;
  origin?: VoteOriginT;
  isGovernance?: boolean;
  voteNumber?: string;
}
export function PanelTitle({ title, origin, isGovernance, voteNumber }: Props) {
  return (
    <Wrapper>
      <TitleIcon origin={origin} isGovernance={isGovernance} />
      <Header id="panel-title">
        {title}
        <SubTitle>
          <SubTitleText voteNumber={voteNumber} origin={origin} />
        </SubTitle>
      </Header>
    </Wrapper>
  );
}

function TitleIcon({
  origin,
  isGovernance,
}: {
  origin?: VoteOriginT;
  isGovernance?: boolean;
}) {
  switch (origin) {
    case "UMA":
      if (isGovernance) {
        return (
          <TitleIconWrapper>
            <UMAGovernanceIcon />
          </TitleIconWrapper>
        );
      } else {
        return (
          <TitleIconWrapper>
            <UMAIcon />
          </TitleIconWrapper>
        );
      }
    case "Across":
      return (
        <TitleIconWrapper>
          <AcrossIcon />
        </TitleIconWrapper>
      );
    case "Polymarket":
      return (
        <TitleIconWrapper>
          <PolymarketIcon />
        </TitleIconWrapper>
      );
    case "OSnap":
      return (
        <TitleIconWrapper>
          <OSnapIcon />
        </TitleIconWrapper>
      );
    default:
      return null;
  }
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
  justify-content: start;
  align-items: center;
  gap: 20px;
  padding: 25px;
  overflow: hidden;

  @media ${mobileAndUnder} {
    gap: max(20px, 5%);
    padding-inline: 15px;
  }
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

const UMAGovernanceIcon = styled(UMAGovernance)``;

const AcrossIcon = styled(Across)``;

const PolymarketIcon = styled(Polymarket)``;

const OSnapIcon = styled(OSnap)``;

const TitleIconWrapper = styled.div`
  width: 40px;
  height: 40px;

  @media ${mobileAndUnder} {
    width: max(40px, 5%);
    height: max(40px, 5%);
  }
`;

const Strong = styled.strong`
  font-weight: 700;
`;
