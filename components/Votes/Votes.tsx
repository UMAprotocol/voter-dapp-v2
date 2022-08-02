import { Button } from "components/Button";
import { VoteBar } from "components/VoteBar";
import { VoteTimeline } from "components/VoteTimeline";
import { usePanelContext } from "hooks/usePanelContext";
import styled from "styled-components";
import { VoteT, VoteTimelineT } from "types/global";

interface Props {
  votes: VoteT[];
  voteTimeline: VoteTimelineT;
}
export function Votes({ votes, voteTimeline }: Props) {
  const { setPanelType, setPanelContent, setPanelOpen } = usePanelContext();

  function commitVotes() {
    console.log("TODO Commit votes");
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
    const { title, origin, voteNumber, description, timestamp, txid, umipNumber, options } = vote.data;
    const panelContent = {
      title,
      origin,
      description,
      timestamp,
      options,
      voteNumber,
      txid,
      umipNumber,
      links: makeVoteLinks(txid, umipNumber),
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
        <VoteTimeline {...voteTimeline} />
        <VotesWrapper>
          <TableHeadingsWrapper>
            <DisputeHeading>Dispute</DisputeHeading>
            <YourVoteHeading>Your vote</YourVoteHeading>
            <VoteStatusHeading>Vote status</VoteStatusHeading>
          </TableHeadingsWrapper>
          {votes.map((vote) => (
            <VoteBar vote={vote} key={vote.data.title} moreDetailsAction={() => openVotePanel(vote)} />
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
