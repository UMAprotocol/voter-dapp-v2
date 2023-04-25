import styled from "styled-components";
import { VoteListProps } from "./VoteList";
import { VoteListItem } from "./VoteListItem/VoteListItem";

export function VotesMobile({ votesToShow, ...delegated }: VoteListProps) {
  return (
    <Wrapper>
      {votesToShow?.map((vote) => (
        <VoteListItem key={vote.uniqueKey} vote={vote} {...delegated} />
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  gap: 5px;
`;
