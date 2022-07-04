import Link from "next/link";
import styled from "styled-components";
import { Nav } from "./Nav";
import Logo from "public/assets/logo.svg";
import { Wallet } from "components/Wallet";

export function Header() {
  return (
    <Wrapper>
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
      <Nav />
      <Wallet />
    </Wrapper>
  );
}

const Wrapper = styled.header`
  min-height: 80px;
  display: grid;
  grid-template-columns: 1fr 1fr 200px;
  align-items: center;
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
