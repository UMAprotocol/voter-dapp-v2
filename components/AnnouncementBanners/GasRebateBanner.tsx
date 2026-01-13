import { mobileAndUnder } from "constant";
import NextLink from "next/link";
import Info from "public/assets/icons/information.svg";
import styled from "styled-components";
import { AnnouncementBannerWrapper } from "./AnnouncementBannerWrapper";

export function GasRebateBanner() {
  return (
    <AnnouncementBannerWrapper localStorageKey="show-gas-rebate-banner-jan-2026">
      <InfoIcon />
      <Text>
        Voter gas rebates for priority gas fees will be capped as of January 14.
        See updated gas rebate details{" "}
        <Link
          href="https://docs.uma.xyz/using-uma/voting-walkthrough/voting-gas-rebates"
          target="_blank"
        >
          here
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
