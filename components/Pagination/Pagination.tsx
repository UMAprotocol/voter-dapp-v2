import { usePaginationContext } from "hooks/contexts/usePaginationContext";
import styled from "styled-components";
import { PaginateForT } from "types/global";

export interface Props {
  paginateFor: PaginateForT;
}

export function Pagination({ paginateFor }: Props) {
  const { pageStates, goToPage, nextPage, previousPage } = usePaginationContext();

  console.log(pageStates["pastVotesPage"]);

  const pageState = pageStates[paginateFor];
  const buttonNumbers = Array.from({ length: 5 }, (_, i) => i + 1);

  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);

  const isActive = (button: number) => button === pageState.number;

  return (
    <Wrapper>
      {buttonNumbers.map((buttonNumber) => (
        <PageButton key={buttonNumber} onClick={() => _goToPage(buttonNumber)} isActive={isActive(buttonNumber)}>
          {buttonNumber}
        </PageButton>
      ))}
      <PreviousPageButton onClick={_previousPage} disabled={pageState.number === 1}>
        &lt;
      </PreviousPageButton>
      <NextPageButton onClick={_nextPage}>&gt;</NextPageButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  gap: 5px;
`;

const PageButton = styled.button<{ isActive?: boolean }>``;

const NavigationButton = styled.button``;

const PreviousPageButton = styled(NavigationButton)``;

const NextPageButton = styled(NavigationButton)``;
