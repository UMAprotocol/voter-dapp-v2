import styled from "styled-components";
import { VotesListProps } from "./VotesList";
import { VotesTableRow } from "./VotesTableRow";

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
