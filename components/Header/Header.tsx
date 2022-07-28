import Link from "next/link";
import styled from "styled-components";
import Logo from "public/assets/logo.svg";
import { Wallet } from "components/Wallet";

export function Header() {
  return (
    <OuterWrapper>
      <InnerWrapper>
        <HomeLinkAndPageDescriptionWrapper>
          <HomeLinkWrapper>
            <Link href="/">
              <HomeLink>
                <LogoIcon />
              </HomeLink>
            </Link>
          </HomeLinkWrapper>
          <PageDescription>VOTING</PageDescription>
        </HomeLinkAndPageDescriptionWrapper>
        <Wallet />
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.header``;

const InnerWrapper = styled.div`
  max-width: var(--desktop-max-width);
  min-height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-inline: auto;
  padding-inline: 45px;
`;

const HomeLinkWrapper = styled.div`
  max-width: 90px;
`;

const HomeLink = styled.a``;

const HomeLinkAndPageDescriptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageDescription = styled.p`
  font-family: "Halyard Display";
  font-style: normal;
  font-weight: 300;
  font-size: 14.5946px;
  line-height: 20px;
  color: var(--black);
`;

const LogoIcon = styled(Logo)``;
