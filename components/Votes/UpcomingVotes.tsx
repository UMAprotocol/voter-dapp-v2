import {
  Button,
  NextRoundStartsIn,
  Pagination,
  VoteList,
  usePagination,
} from "components";
import { useVoteList } from "../VoteList/useVoteList";
import {
  ButtonInnerWrapper,
  ButtonOuterWrapper,
  Divider,
  PaginationWrapper,
  Title,
  VoteListWrapper,
} from "./style";

interface Props {
  isHomePage?: boolean;
}
export function UpcomingVotes({ isHomePage = false }: Props) {
  const voteListProps = useVoteList("upcoming");
  const { voteList } = voteListProps;
  const { showPagination, entriesToShow, ...paginationProps } =
    usePagination(voteList);
  const showSeeAllButton = voteList.length > 5;
  const votesToShow = isHomePage ? voteList.slice(0, 5) : entriesToShow;

  return (
    <>
      <Title>Upcoming votes:</Title>
      <NextRoundStartsIn />
      <VoteListWrapper>
        <VoteList {...voteListProps} votesToShow={votesToShow} />
      </VoteListWrapper>
      {isHomePage
        ? showSeeAllButton && (
            <ButtonOuterWrapper>
              <ButtonInnerWrapper>
                <Button
                  label="See all"
                  href="/upcoming-votes"
                  variant="primary"
                />
              </ButtonInnerWrapper>
            </ButtonOuterWrapper>
          )
        : showPagination && (
            <PaginationWrapper>
              <Pagination {...paginationProps} />
            </PaginationWrapper>
          )}
      {isHomePage && <Divider />}
    </>
  );
}
