import { mobileAndUnder } from "constant";
import Info from "public/assets/icons/information.svg";
import styled from "styled-components";
import { AnnouncementBannerWrapper } from "./AnnouncementBannerWrapper";

export function VoteHistoryBanner() {
  return (
    <AnnouncementBannerWrapper localStorageKey="show-vote-history-banner">
      <InfoIcon />
      <Text>
        <strong>Voter history</strong> and interim <strong>vote results</strong>{" "}
        during the reveal phase are temporarily not displaying correctly due to
        data provider errors from increased activity.
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
