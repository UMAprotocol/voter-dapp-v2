import { usePaginationContext } from "hooks/contexts/usePaginationContext";
import styled from "styled-components";
import { PaginateForT } from "types/global";

export interface Props {
  paginateFor: PaginateForT;
  lastPageNumber: number;
}

export function Pagination({ paginateFor, lastPageNumber }: Props) {
  const { pageStates, goToPage, nextPage, previousPage, lastPage } = usePaginationContext();

  console.log(pageStates["pastVotesPage"]);

  const pageState = pageStates[paginateFor];
  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);
  const _lastPage = () => lastPage(paginateFor);

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
      <Ellipsis />
      <LastPageButton onClick={_lastPage}>{lastPageNumber}</LastPageButton>
      <PreviousPageButton onClick={_previousPage}>Back</PreviousPageButton>
      <NextPageButton onClick={_nextPage}>Next</NextPageButton>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const PageButton = styled.button<{ isActive?: boolean }>``;

const LastPageButton = styled(PageButton)``;

const NavigationButton = styled.button``;

const PreviousPageButton = styled(NavigationButton)``;

const NextPageButton = styled(NavigationButton)``;

const Ellipsis = styled.div``;
