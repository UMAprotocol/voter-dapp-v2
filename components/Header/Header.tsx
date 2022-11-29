import { Wallet } from "components";
import {
  green,
  mobileAndUnder,
  red100,
  red500,
  tabletAndUnder,
} from "constant";
import { formatNumberForDisplay } from "helpers";
import {
  useDelegationContext,
  usePanelContext,
  useStakingContext,
} from "hooks";
import NextLink from "next/link";
import Bell from "public/assets/icons/bell.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Logo from "public/assets/logo.svg";
import styled, { CSSProperties } from "styled-components";
import Menu from "/public/assets/icons/menu.svg";

export function Header() {
  const { openPanel } = usePanelContext();
  const { getDelegationStatus, getDelegationDataLoading } =
    useDelegationContext();
  const { v1Rewards } = useStakingContext();

  const status = getDelegationStatus();
  const showDelegationNotification =
    !getDelegationDataLoading() &&
    (status === "delegate" || status === "delegate-pending");
  const showV1RewardsNotification = v1Rewards?.totalRewards.gt(0);
  const isDelegate = status === "delegate";
  const isDelegatePending = status === "delegate-pending";

  const delegationNotificationStyle = {
    "--color": isDelegate ? green : red500,
    "--border-color": isDelegate ? "transparent" : red500,
    "--background-color": isDelegate ? "transparent" : red100,
  } as CSSProperties;

  const v1RewardsNotificationStyle = {
    "--color": red500,
    "--border-color": red500,
    "--background-color": red100,
  } as CSSProperties;

  function openMenuPanel() {
    openPanel("menu");
  }

  function openClaimPanel() {
    openPanel("claim");
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
            <NotificationWrapper style={delegationNotificationStyle}>
              {isDelegatePending && (
                <NotificationIconWrapper>
                  <DelegateRequestNotificationIcon />
                </NotificationIconWrapper>
              )}
              <NotificationText>
                <Link href="/wallet-settings">
                  <>
                    {isDelegatePending && "Received delegate request"}
                    {isDelegate && "Delegate connected"}
                  </>
                </Link>
              </NotificationText>
              <MobileNotificationText>
                <Link href="/wallet-settings">Delegate</Link>
              </MobileNotificationText>
            </NotificationWrapper>
          )}
          {showV1RewardsNotification && (
            <NotificationWrapper style={v1RewardsNotificationStyle}>
              <NotificationIconWrapper>
                <V1RewardsNotificationIcon />
              </NotificationIconWrapper>
              <NotificationText>
                <Strong>
                  {formatNumberForDisplay(v1Rewards?.totalRewards)}
                </Strong>{" "}
                UMA from v1{" "}
                <OpenClaimPanelButton onClick={openClaimPanel}>
                  ready to claim
                </OpenClaimPanelButton>
              </NotificationText>
              <MobileNotificationText>
                <OpenClaimPanelButton onClick={openClaimPanel}>
                  Rewards
                </OpenClaimPanelButton>
              </MobileNotificationText>
            </NotificationWrapper>
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

const NotificationWrapper = styled.div`
  height: 40px;
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
    height: fit-content;
    padding: 5px;
    gap: 5px;
    font: var(--text-xs);
  }
`;

const WalletWrapper = styled.div`
  @media ${mobileAndUnder} {
    display: none;
  }
`;

const NotificationText = styled.p`
  @media ${tabletAndUnder} {
    display: none;
  }
`;

const MobileNotificationText = styled(NotificationText)`
  display: none;
  @media ${tabletAndUnder} {
    display: block;
  }
`;

const OuterWrapper = styled.header``;

const InnerWrapper = styled.div`
  max-width: var(--page-width);
  height: var(--header-height);
  padding-inline: var(--page-padding);
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
  align-items: center;
  gap: 25px;

  @media ${mobileAndUnder} {
    gap: 15px;
  }
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

const Strong = styled.strong`
  font-weight: 700;
`;

const DelegateRequestNotificationIcon = styled(Time)``;

const V1RewardsNotificationIcon = styled(Bell)``;

const Link = styled(NextLink)`
  color: inherit;
  text-decoration: underline;
`;

const OpenClaimPanelButton = styled.button`
  color: inherit;
  font: inherit;
  background: none;
  border: none;
  text-decoration: underline;
`;

const NotificationIconWrapper = styled.div`
  width: 24px;
  height: 24px;

  @media ${mobileAndUnder} {
    width: 10px;
    height: 10px;
  }
`;
