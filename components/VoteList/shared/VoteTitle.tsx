import { Tooltip } from "@reach/tooltip";
import { getProjectIcon, tabletAndUnder } from "constant";
import NextLink from "next/link";
import Rolled from "public/assets/icons/rolled.svg";
import styled from "styled-components";
import { VoteOriginT } from "types";
import { VoteListItemState } from ".";

export function VoteTitle({
  origin,
  title,
  showRolledVoteExplanation,
  voteNumber,
  formattedDate,
  rollCount,
}: VoteListItemState) {
  return (
    <VoteTitleWrapper>
      <ProjectIcon origin={origin} />
      <VoteDetailsWrapper>
        <VoteTitleText>{title}</VoteTitleText>
        <VoteDetailsInnerWrapper>
          {showRolledVoteExplanation && (
            <RolledVoteExplanation rollCount={rollCount} />
          )}
          <VoteOrigin>
            {origin} {!!voteNumber && `| Vote #${voteNumber}`} | {formattedDate}
          </VoteOrigin>
        </VoteDetailsInnerWrapper>
      </VoteDetailsWrapper>
    </VoteTitleWrapper>
  );
}

function RolledVoteExplanation({ rollCount }: { rollCount: number }) {
  return (
    <Tooltip label="This vote was included in the previous voting cycle, but did not get enough votes to resolve.">
      <RolledWrapper>
        <RolledIconWrapper>
          <RolledIcon />
        </RolledIconWrapper>
        <RolledLink
          href="https://docs.uma.xyz/protocol-overview/dvm-2.0#rolled-votes"
          target="_blank"
        >
          Roll #{rollCount}
        </RolledLink>
      </RolledWrapper>
    </Tooltip>
  );
}

function ProjectIcon({ origin }: { origin: VoteOriginT }) {
  const icon = getProjectIcon(origin);

  return <ProjectIconWrapper>{icon}</ProjectIconWrapper>;
}

const VoteTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: var(--cell-padding);

  @media ${tabletAndUnder} {
    gap: unset;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--border-color);
  }
`;

const VoteTitleText = styled.h3`
  font: var(--header-sm);
  max-width: calc(
    var(--title-cell-width) - var(--title-icon-size) - 3 * var(--cell-padding)
  );
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${tabletAndUnder} {
    max-width: unset;
    white-space: unset;
    overflow: unset;
    text-overflow: unset;
    margin-bottom: 5px;
  }
`;

const VoteDetailsWrapper = styled.div``;

const VoteDetailsInnerWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const ProjectIconWrapper = styled.div`
  width: var(--title-icon-size);
  height: var(--title-icon-size);

  @media ${tabletAndUnder} {
    display: none;
  }
`;

const VoteOrigin = styled.h4`
  font: var(--text-xs);
  color: var(--black-opacity-50);
`;

const RolledWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
`;

const RolledIconWrapper = styled.div`
  width: 7px;
  height: 7px;
`;

const RolledIcon = styled(Rolled)``;

const RolledLink = styled(NextLink)`
  font: var(--text-sm);
  color: var(--red-500);
  text-decoration: underline;
`;
