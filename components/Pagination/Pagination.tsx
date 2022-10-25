import { Dropdown } from "components/Dropdown";
import { usePaginationContext } from "hooks/contexts/usePaginationContext";
import styled from "styled-components";
import { DropdownItemT, PaginateForT } from "types/global";

export interface Props {
  paginateFor: PaginateForT;
}

export function Pagination({ paginateFor }: Props) {
  const { pageStates, goToPage, nextPage, previousPage, setResultsPerPage } = usePaginationContext();

  console.log(pageStates["pastVotesPage"]);
  const pageState = pageStates[paginateFor];
  const numberOfButtons = 5;
  const numbersPastMax = pageState.number - numberOfButtons;
  const buttonNumbers = Array.from({ length: 5 }, (_, i) => i + 1).map((number) => {
    if (numbersPastMax > 0) {
      return number + numbersPastMax;
    }
    return number;
  });

  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);
  const _setResultsPerPage = (resultsPerPage: number) => setResultsPerPage(paginateFor, resultsPerPage);

  const isActive = (button: number) => button === pageState.number;

  const resultsPerPageOptions = [
    { value: 5, label: "5" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ];

  function getSelectedResultsPerPage() {
    return resultsPerPageOptions.find((option) => option.value === pageState.resultsPerPage);
  }

  function onSelectResultsPerPage(item: DropdownItemT) {
    _setResultsPerPage(Number(item.value));
  }

  return (
    <Wrapper>
      <Dropdown
        items={resultsPerPageOptions}
        label="Results per page"
        selected={getSelectedResultsPerPage()}
        onSelect={onSelectResultsPerPage}
      />
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
