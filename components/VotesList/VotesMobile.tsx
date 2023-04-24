import styled from "styled-components";
import { VotesTableRow } from "./VoteListItem/VotesTableRow";
import { VotesListProps } from "./VotesList";

export function VotesMobile({ votesToShow, ...delegated }: VotesListProps) {
  return (
    <Wrapper>
      {votesToShow?.map((vote) => (
        <VotesTableRow key={vote.uniqueKey} vote={vote} {...delegated} />
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  gap: 5px;
`;
