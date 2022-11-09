import { Wallet } from "components";
import {
  green,
  mobileAndUnder,
  red100,
  red500,
  tabletAndUnder,
} from "constant";
import { useDelegationContext, usePanelContext } from "hooks";
import NextLink from "next/link";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Logo from "public/assets/logo.svg";
import styled, { CSSProperties } from "styled-components";
import Menu from "/public/assets/icons/menu.svg";

export function Header() {
  const { openPanel } = usePanelContext();
  const { getDelegationStatus, getDelegationDataLoading } =
    useDelegationContext();

  const status = getDelegationStatus();
  const showDelegationNotification =
    !getDelegationDataLoading() &&
    (status === "delegate" || status === "delegate-pending");
  const isDelegate = status === "delegate";
  const isDelegatePending = status === "delegate-pending";

  const delegationNotificationStyle = {
    "--color": isDelegate ? green : red500,
    "--border-color": isDelegate ? "transparent" : red500,
    "--background-color": isDelegate ? "transparent" : red100,
  } as CSSProperties;

  function openMenuPanel() {
    openPanel("menu");
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <HomeLinkAndPageDescriptionWrapper>
          <HomeLinkWrapper>
            <HomeLink href="/">
              <LogoIcon />
            </HomeLink>
          </HomeLinkWrapper>
          <PageDescription>VOTING</PageDescription>
        </HomeLinkAndPageDescriptionWrapper>
        <WalletAndMenuWrapper>
          {showDelegationNotification && (
            <DelegationNotificationWrapper style={delegationNotificationStyle}>
              {isDelegatePending && (
                <DelegationNotificationIconWrapper>
                  <DelegationNotificationIcon />
                </DelegationNotificationIconWrapper>
              )}
              <DelegationNotificationText>
                <NextLink href="/wallet-settings" passHref>
                  <>
                    {isDelegatePending && <A>Received request</A>}
                    {isDelegate && <A>Delegate connected</A>}
                  </>
                </NextLink>
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
  color: var(--color);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
    gap: 5px;
    font: var(--text-xs);
  }
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

const HomeLink = styled(NextLink)``;

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
  color: inherit;
  text-decoration: underline;
`;

const DelegationNotificationIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;
