import { Dropdown } from "components";
import { grey800, white } from "constants/colors";
import { addOpacityToHsl } from "helpers";
import { usePaginationContext } from "hooks";
import PreviousPage from "public/assets/icons/left-chevron.svg";
import NextPage from "public/assets/icons/right-chevron.svg";
import styled, { CSSProperties } from "styled-components";
import { DropdownItemT, PaginateForT } from "types";

export interface Props {
  paginateFor: PaginateForT;
  numberOfEntries: number;
}

export function Pagination({ paginateFor, numberOfEntries }: Props) {
  const { pageStates, goToPage, nextPage, previousPage, firstPage, lastPage, setResultsPerPage } =
    usePaginationContext();

  const { pageNumber, resultsPerPage } = pageStates[paginateFor];
  const numberOfPages = Math.ceil(numberOfEntries / resultsPerPage);
  const lastPageNumber = numberOfPages;
  const defaultNumberOfButtons = 4;
  const hasMorePagesThanButtons = numberOfPages >= defaultNumberOfButtons;
  const showLastButton = hasMorePagesThanButtons;
  const numberOfButtons = hasMorePagesThanButtons ? defaultNumberOfButtons : numberOfPages;
  const numbersPastMax = pageNumber - numberOfButtons;

  const buttonNumbers = makeButtonNumbers();

  function makeButtonNumbers() {
    const s = 2 * numberOfButtons + numbersPastMax;
    const isLastPastNumbers = s >= numberOfPages;
    console.log({ s, isLastPastNumbers, lastPageNumber, numbersPastMax, numberOfButtons, hasMorePagesThanButtons });

    if (isLastPastNumbers) {
      return Array.from({ length: numberOfButtons }, (_, i) => lastPageNumber - numberOfButtons + i);
    }

    return Array.from({ length: numberOfButtons }, (_, i) => i + 2).map((number) => {
      if (numbersPastMax > 0) {
        return number + numbersPastMax;
      }
      return number;
    });
  }

  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);
  const _firstPage = () => firstPage(paginateFor);
  const _lastPage = () => lastPage(paginateFor, lastPageNumber);
  const _setResultsPerPage = (resultsPerPage: number) => setResultsPerPage(paginateFor, resultsPerPage);

  const isActive = (button: number) => button === pageNumber;

  const resultsPerPageOptions = [
    { value: 5, label: "5 results" },
    { value: 20, label: "20 results" },
    { value: 50, label: "50 results" },
  ];

  function getSelectedResultsPerPage() {
    return resultsPerPageOptions.find((option) => option.value === resultsPerPage);
  }

  function onSelectResultsPerPage(item: DropdownItemT) {
    _setResultsPerPage(Number(item.value));
  }

  function getPageButtonStyle(buttonNumber: number) {
    return {
      "--color": isActive(buttonNumber) ? white : grey800,
      "--background-color": isActive(buttonNumber) ? grey800 : "transparent",
    } as CSSProperties;
  }

  return (
    <Wrapper>
      <ResultsPerPageWrapper>
        <Dropdown
          items={resultsPerPageOptions}
          label="Results per page"
          selected={getSelectedResultsPerPage()}
          onSelect={onSelectResultsPerPage}
          textColor={grey800}
          borderColor={grey800}
        />
      </ResultsPerPageWrapper>
      <ButtonsWrapper>
        <PageButton onClick={_firstPage} disabled={pageNumber === 1} style={getPageButtonStyle(1)}>
          1
        </PageButton>
        {buttonNumbers.map((buttonNumber) => (
          <PageButton
            key={buttonNumber}
            onClick={() => _goToPage(buttonNumber)}
            style={getPageButtonStyle(buttonNumber)}
          >
            {buttonNumber}
          </PageButton>
        ))}
        {showLastButton && (
          <>
            <Ellipsis>...</Ellipsis>
            <PageButton onClick={_lastPage} style={getPageButtonStyle(lastPageNumber)}>
              {lastPageNumber}
            </PageButton>
          </>
        )}
        <PreviousPageButton onClick={_previousPage} disabled={pageNumber === 1}>
          <PreviousPage />
        </PreviousPageButton>
        <NextPageButton onClick={_nextPage} disabled={pageNumber === lastPageNumber}>
          <NextPage />
        </NextPageButton>
      </ButtonsWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultsPerPageWrapper = styled.div`
  width: 120px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const BaseButton = styled.button`
  height: 32px;
  min-width: 32px;
  display: grid;
  place-items: center;
  font: var(--text-sm);
  color: var(--grey-800);
  background: transparent;
  border-radius: 5px;
  &:hover {
    background: ${addOpacityToHsl(grey800, 0.1)};
  }
  transition: color 200ms, background 200ms;
`;

const PageButton = styled(BaseButton)`
  color: var(--color);
  background: var(--background-color);
  border: 1px solid var(--grey-800);
  &:hover {
    color: var(--grey-800);
  }
`;

const NavigationButton = styled(BaseButton)`
  :disabled {
    opacity: 0.5;
  }
`;

const PreviousPageButton = styled(NavigationButton)``;

const NextPageButton = styled(NavigationButton)``;

const Ellipsis = styled.span`
  height: min-content;
  margin-top: auto;
  font: var(--text-sm);
  color: var(--grey-800);
`;
