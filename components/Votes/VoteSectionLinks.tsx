import { mobileAndUnder } from "constant";
import { useVotesContext } from "hooks";
import Link from "next/link";
import Clickable from "public/assets/icons/clickable.svg";
import styled from "styled-components";

// Upcoming and past votes have their own pages. These links keep them one
// tap away and show how many votes are coming up.
export function VoteSectionLinks() {
  const { upcomingVoteList, upcomingVotesIsLoading } = useVotesContext();
  const upcomingCount = upcomingVoteList?.length ?? 0;

  return (
    <Wrapper aria-label="More votes">
      <SectionLink href="/upcoming-votes">
        <Text>
          <Label>Upcoming votes</Label>
          <Detail>
            {upcomingVotesIsLoading
              ? "Loading..."
              : `${upcomingCount} ${upcomingCount === 1 ? "vote" : "votes"}`}
          </Detail>
        </Text>
        <Arrow aria-hidden />
      </SectionLink>
      <SectionLink href="/past-votes">
        <Text>
          <Label>Past votes</Label>
          <Detail>See results</Detail>
        </Text>
        <Arrow aria-hidden />
      </SectionLink>
    </Wrapper>
  );
}

const Wrapper = styled.nav`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  width: 100%;
  margin-top: 30px;

  @media ${mobileAndUnder} {
    gap: 10px;
  }
`;

const SectionLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 20px 25px;
  background: var(--white);
  border-radius: 5px;
  color: var(--black);
  text-decoration: none;

  &:hover svg {
    fill: var(--red-500);

    path {
      stroke: var(--white);
    }
  }

  @media ${mobileAndUnder} {
    padding: 12px 15px;
  }
`;

const Text = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
`;

const Label = styled.span`
  font: var(--text-md);
  font-weight: 600;

  @media ${mobileAndUnder} {
    font: var(--text-sm);
    font-weight: 600;
  }
`;

const Detail = styled.span`
  font: var(--text-sm);
  color: var(--grey-800);
`;

const Arrow = styled(Clickable)`
  flex: none;
  transition: fill 300ms;

  path {
    transition: stroke 300ms;
  }
`;
