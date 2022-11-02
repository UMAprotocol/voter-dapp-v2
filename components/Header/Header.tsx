import { Wallet } from "components";
import { mobileAndUnder, tabletAndUnder } from "constants/breakpoints";
import { useDelegationContext, usePanelContext } from "hooks";
import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Logo from "public/assets/logo.svg";
import styled from "styled-components";
import Menu from "/public/assets/icons/menu.svg";

export function Header() {
  const { openPanel } = usePanelContext();
  const { getDelegationStatus, getDelegationDataLoading } =
    useDelegationContext();

  const showDelegationNotification =
    !getDelegationDataLoading() && getDelegationStatus() === "delegate-pending";

  function openMenuPanel() {
    openPanel("menu");
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <HomeLinkAndPageDescriptionWrapper>
          <HomeLinkWrapper>
            <NextLink href="/">
              <HomeLink>
                <LogoIcon />
              </HomeLink>
            </NextLink>
          </HomeLinkWrapper>
          <PageDescription>VOTING</PageDescription>
        </HomeLinkAndPageDescriptionWrapper>
        <WalletAndMenuWrapper>
          {showDelegationNotification && (
            <DelegationNotificationWrapper>
              <DelegationNotificationIcon />
              <DelegationNotificationText>
                <NextLink href="/wallet-settings" passHref>
                  <A>Received request</A>
                </NextLink>{" "}
                to be a delegate
              </DelegationNotificationText>
            </DelegationNotificationWrapper>
          )}
          <WalletWrapper>
            <Wallet />
          </WalletWrapper>
          <MenuButton onClick={openMenuPanel}>
            <MenuIconWrapper>
              <MenuIcon />
            </MenuIconWrapper>
          </MenuButton>
        </WalletAndMenuWrapper>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const DelegationNotificationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 15px;
  padding-right: 25px;
  font: var(--text-sm);
  color: var(--red-500);
  background: var(--red-100);
  border: 1px solid var(--red-500);
  border-radius: 5px;
`;

const WalletWrapper = styled.div`
  @media ${mobileAndUnder} {
    display: none;
  }
`;

const DelegationNotificationText = styled.p``;

const OuterWrapper = styled.header``;

const InnerWrapper = styled.div`
  max-width: var(--page-width);
  height: var(--header-height);
  padding-inline: 45px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-inline: auto;
  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
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

const WalletAndMenuWrapper = styled.div`
  display: flex;
  gap: 25px;
`;

const PageDescription = styled.p`
  @media ${mobileAndUnder} {
    display: none;
  }
  font-family: "Halyard Display";
  font-style: normal;
  font-weight: 300;
  font-size: 14.5946px;
  line-height: 20px;
  color: var(--black);
`;

const LogoIcon = styled(Logo)``;

const MenuIcon = styled(Menu)``;

const MenuButton = styled.button`
  background: none;
`;

const MenuIconWrapper = styled.div`
  width: 40px;
  height: 40px;
`;

const DelegationNotificationIcon = styled(Time)`
  margin-top: 2px;
`;

const A = styled.a`
  color: var(--red-500);
  text-decoration: underline;
`;
