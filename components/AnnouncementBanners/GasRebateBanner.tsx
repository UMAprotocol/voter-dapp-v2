import { mobileAndUnder } from "constant";
import NextLink from "next/link";
import Info from "public/assets/icons/information.svg";
import styled from "styled-components";
import { AnnouncementBannerWrapper } from "./AnnouncementBannerWrapper";

export function GasRebateBanner() {
  return (
    <AnnouncementBannerWrapper localStorageKey="show-gas-rebate-banner-june-2026">
      <InfoIcon />
      <Text>
        Starting June 15th, delegates that are part of a voting pool (UMA.rocks
        or others) will no longer be eligible for monthly voting gas rebates.{" "}
        <Link
          href="https://docs.uma.xyz/using-uma/voting-walkthrough/voting-gas-rebates"
          target="_blank"
        >
          Learn more
        </Link>
        .
      </Text>
    </AnnouncementBannerWrapper>
  );
}

const InfoIcon = styled(Info)`
  --size: 24px;
  height: var(--size);
  width: var(--size);
  color: red;
  flex-shrink: 0;

  @media ${mobileAndUnder} {
    display: none;
  }
`;

const Text = styled.p`
  font: var(--text-md);
  font-size: clamp(0.75rem, calc(0.45rem + 1.6vw), 1rem);
  color: var(--white);
`;

const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;
