import styled from "styled-components";
import { VotesListItem } from "./VoteListItem/VotesListItem";
import { VotesListProps } from "./VotesList";

export function VotesMobile({ votesToShow, ...delegated }: VotesListProps) {
  return (
    <Wrapper>
      {votesToShow?.map((vote) => (
        <VotesListItem key={vote.uniqueKey} vote={vote} {...delegated} />
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  gap: 5px;
`;
