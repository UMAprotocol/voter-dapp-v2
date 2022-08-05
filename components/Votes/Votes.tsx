import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import unixTimestampToDate from "helpers/unixTimestampToDate";
import useActiveVotes from "hooks/useActiveVotes";
import { useContractsContext } from "hooks/useContractsContext";
import useCurrentRoundId from "hooks/useCurrentRoundId";
import { usePanelContext } from "hooks/usePanelContext";
import useRoundEndTime from "hooks/useRoundEndTime";
import useVotePhase from "hooks/useVotePhase";
import { useState } from "react";
import styled from "styled-components";
import { VoteT } from "types/global";

interface Props {
  votes: VoteT[];
}
export function Votes({ votes }: Props) {
  const initialSelectedVotes: Record<string, string> = {};
  votes.forEach((vote) => {
    initialSelectedVotes[vote.identifier] = "";
  });
  const [selectedVotes, setSelectedVotes] = useState(initialSelectedVotes);
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();
  const { voting } = useContractsContext();
  const { votePhase } = useVotePhase(voting);
  const { currentRoundId } = useCurrentRoundId(voting);
  const { roundEndTime } = useRoundEndTime(voting, currentRoundId);
  const { activeVotes } = useActiveVotes(voting);

  function selectVote(identifier: string, value: string) {
    setSelectedVotes((votes) => ({ ...votes, [identifier]: value }));
  }

  function commitVotes() {
    console.log({ selectedVotes });
  }

  function makeVoteLinks(txid: string, umipNumber: number) {
    return [
      {
        label: `UMIP ${umipNumber}`,
        href: `https://github.com/UMAprotocol/UMIPs/blob/master/UMIPs/umip-${umipNumber}.md`,
      },
      {
        label: "Dispute transaction",
        href: `https://etherscan.io/tx/${txid}`,
      },
      {
        label: "Optimistic Oracle UI",
        href: `https://oracle.umaproject.org/request?requester=${txid}`,
      },
    ];
  }

  function openVotePanel(vote: VoteT) {
    const panelContent = {
      ...vote,
      links: makeVoteLinks(vote.txid, vote.umipNumber),
      discordLink: "https://www.todo.com",
    };
    setPanelType("vote");
    setPanelContent(panelContent);
    setPanelOpen(true);
  }

  return (
    <OuterWrapper>
      <InnerWrapper>
        <Title>Vote on active disputes:</Title>
        {votePhase && roundEndTime ? (
          <VoteTimeline phase={votePhase} phaseEnds={unixTimestampToDate(roundEndTime)} />
        ) : null}
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>Your vote</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {votes.map((vote) => (
            <VoteBar
              vote={vote}
              selectedVote={selectedVotes[vote.identifier]}
              selectVote={selectVote}
              key={vote.title}
              moreDetailsAction={() => openVotePanel(vote)}
            />
          ))}
        </VotesWrapper>
        <CommitVotesButtonWrapper>
          <Button variant="primary" label="Commit votes" onClick={commitVotes} />
        </CommitVotesButtonWrapper>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  background: var(--grey-100);
`;

const InnerWrapper = styled.div`
  margin-inline: auto;
  max-width: var(--desktop-max-width);
  padding-inline: 45px;
  padding-block: 45px;
`;

const Title = styled.h1`
  font: var(--header-md);
  margin-bottom: 20px;
`;

const VotesWrapper = styled.div`
  > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

const TableHeadingsWrapper = styled.div`
  display: grid;
  grid-template-columns: 45% 240px 1fr;
  justify-items: start;
  margin-bottom: 5px;
  margin-top: 40px;
`;

const DisputeHeading = styled.h2`
  font: var(--text-sm);
`;

const YourVoteHeading = styled.h2`
  font: var(--text-sm);
`;

const VoteStatusHeading = styled.h2`
  margin-left: 45px;
  font: var(--text-sm);
`;

const CommitVotesButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  margin-top: 30px;
`;
