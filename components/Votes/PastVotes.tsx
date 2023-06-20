import { Button, Pagination, VoteList, usePagination } from "components";
import { useVoteList } from "../VoteList/shared/useVoteList";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  PaginationWrapper,
  Title,
  VoteListWrapper,
} from "./style.shared";

interface Props {
  isHomePage?: boolean;
}
export function PastVotes({ isHomePage = false }: Props) {
  const voteListProps = useVoteList("past");
  const { voteList } = voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);
  const titleText = isHomePage ? "Recent past votes:" : "Past votes:";
  const showSeeAllButton = voteList.length > 5;
  const votesToShow = isHomePage ? voteList.slice(0, 5) : entriesToShow;

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
