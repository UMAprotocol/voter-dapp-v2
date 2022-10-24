import { usePaginationContext } from "hooks/contexts/usePaginationContext";
import styled from "styled-components";
import { PaginateForT } from "types/global";

export interface Props {
  paginateFor: PaginateForT;
  numberOfVotes: number;
}

export function Pagination({ paginateFor, numberOfVotes }: Props) {
  const { pageStates, goToPage, nextPage, previousPage, lastPage } = usePaginationContext();

  console.log(pageStates["pastVotesPage"]);

  const pageState = pageStates[paginateFor];
  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);
  const lastPageNumber = Math.ceil(numberOfVotes / pageState.resultsPerPage);
  const _lastPage = () => lastPage(paginateFor, lastPageNumber);
  const buttonNumbers = Array.from({ length: 5 }, (_, i) => i + 1);

  function isActive(button: number) {
    return button === pageState.number;
  }

  return (
    <Wrapper>
      {buttonNumbers.map((buttonNumber) => (
        <PageButton key={buttonNumber} onClick={() => _goToPage(buttonNumber)} isActive={isActive(buttonNumber)}>
          {buttonNumber}
        </PageButton>
      ))}
      <Ellipsis>...</Ellipsis>
      <LastPageButton onClick={_lastPage}>{lastPageNumber}</LastPageButton>
      <PreviousPageButton onClick={_previousPage}>&lt;</PreviousPageButton>
      <NextPageButton onClick={_nextPage}>&gt;</NextPageButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  gap: 5px;
`;

const PageButton = styled.button<{ isActive?: boolean }>``;

const LastPageButton = styled(PageButton)``;

const NavigationButton = styled.button``;

const PreviousPageButton = styled(NavigationButton)``;

const NextPageButton = styled(NavigationButton)``;

const Ellipsis = styled.div``;
