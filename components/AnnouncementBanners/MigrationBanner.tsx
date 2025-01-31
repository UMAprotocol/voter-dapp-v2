import { mobileAndUnder, tabletAndUnder } from "constant";
import NextLink from "next/link";
import Logo from "public/assets/icons/uma-2.svg";
import styled from "styled-components";
import { AnnouncementBannerWrapper } from "./AnnouncementBannerWrapper";

export function MigrationBanner() {
  return (
    <AnnouncementBannerWrapper localStorageKey="show-migration-banner">
      <LogoIcon />
      <Text>
        Welcome to the UMA 2.0 voting app. Read our{" "}
        <Link
          href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091"
          target="_blank"
        >
          migration and staking instructions here.
        </Link>
      </Text>
      <TabletText>
        Welcome to UMA 2.0. Learn now to{" "}
        <Link
          href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091"
          target="_blank"
        >
          migrate and stake.
        </Link>
      </TabletText>
      <MobileText>
        Welcome to UMA 2.0.{" "}
        <Link
          href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091"
          target="_blank"
        >
          Migrate now.
        </Link>
      </MobileText>
    </AnnouncementBannerWrapper>
  );
}

const LogoIcon = styled(Logo)`
  margin-right: var(--page-padding);
  width: clamp(3.5rem, calc(2.08rem + 7.6vw), 4.69rem);
  @media ${mobileAndUnder} {
    margin-right: clamp(0.25rem, calc(-0.05rem + 1.6vw), 0.5rem);
  }
`;

const Text = styled.p`
  font: var(--text-md);
  font-size: clamp(0.75rem, calc(0.45rem + 1.6vw), 1rem);
  color: var(--white);
  @media ${tabletAndUnder} {
    display: none;
  }
`;

const TabletText = styled(Text)`
  display: none;
  @media ${tabletAndUnder} {
    display: block;
  }
  @media ${mobileAndUnder} {
    display: none;
  }
`;

const MobileText = styled(Text)`
  display: none;
  @media ${mobileAndUnder} {
    display: block;
  }
`;

const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
