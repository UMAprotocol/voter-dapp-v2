import { Button, Pagination, VoteList, usePagination } from "components";
import { useVoteList } from "../VoteList/useVoteList";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  PaginationWrapper,
  Title,
  VoteListWrapper,
} from "./style";

interface Props {
  isHomePage?: boolean;
}
export function PastVotes({ isHomePage = false }: Props) {
  const voteListProps = useVoteList("past");
  const { votesList } = voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(votesList);
  const titleText = isHomePage ? "Recent past votes:" : "Past votes:";
  const showSeeAllButton = votesList.length > 5;
  const votesToShow = isHomePage ? votesList.slice(0, 5) : entriesToShow;

  return (
    <>
      <Title>{titleText}</Title>
      <VoteListWrapper>
        <VoteList {...voteListProps} votesToShow={votesToShow} />
      </VoteListWrapper>
      {isHomePage
        ? showSeeAllButton && (
            <ButtonOuterWrapper>
              <ButtonInnerWrapper>
                <Button label="See all" href="/past-votes" variant="primary" />
              </ButtonInnerWrapper>
            </ButtonOuterWrapper>
          )
        : showPagination && (
            <PaginationWrapper>
              <Pagination {...paginationProps} />
            </PaginationWrapper>
          )}
    </>
  );
}
