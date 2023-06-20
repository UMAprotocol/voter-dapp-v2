import styled from "styled-components";
import { VoteT } from "types";
import { VoteListProps } from "../shared";
import { VoteListItem } from "./VoteListItem";

export function VotesMobile({
  votesToShow,
  ...delegated
}: VoteListProps & { votesToShow: VoteT[] }) {
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
