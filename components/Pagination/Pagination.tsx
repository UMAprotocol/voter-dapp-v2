import { Dropdown } from "components";
import { grey800, mobileAndUnder, mobileMax, white } from "constant";
import { addOpacityToHsl } from "helpers";
import { usePaginationContext, useWindowSize } from "hooks";
import PreviousPage from "public/assets/icons/left-chevron.svg";
import NextPage from "public/assets/icons/right-chevron.svg";
import styled from "styled-components";
import { DropdownItemT, PaginateForT } from "types";

export interface Props {
  paginateFor: PaginateForT;
  numberOfEntries: number;
}

export function Pagination({ paginateFor, numberOfEntries }: Props) {
  const {
    pageStates,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setResultsPerPage,
  } = usePaginationContext();
  const { width } = useWindowSize();

  if (!width) return <></>;

  const { pageNumber, resultsPerPage } = pageStates[paginateFor];
  const numberOfPages = Math.ceil(numberOfEntries / resultsPerPage);
  const lastPageNumber = numberOfPages;
  const desktopNumberOfButtons = 4;
  const mobileNumberOfButtons = 2;
  const defaultNumberOfButtons =
    width <= mobileMax ? mobileNumberOfButtons : desktopNumberOfButtons;
  const hasMorePagesThanButtons = numberOfPages >= defaultNumberOfButtons;
  const showFirstButton = hasMorePagesThanButtons;
  const showLastButton = hasMorePagesThanButtons;
  const numberOfButtons = hasMorePagesThanButtons
    ? defaultNumberOfButtons
    : numberOfPages;
  const numbersPastMax = pageNumber - numberOfButtons;

  const buttonNumbers = makeButtonNumbers();

  function makeButtonNumbers() {
    if (!hasMorePagesThanButtons) {
      return Array.from({ length: numberOfPages }, (_, i) => i + 1);
    }

    const isLastPastNumbers =
      2 * numberOfButtons + numbersPastMax >= numberOfPages;

    if (isLastPastNumbers) {
      return Array.from(
        { length: numberOfButtons },
        (_, i) => lastPageNumber - numberOfButtons + i
      );
    }

    return Array.from({ length: numberOfButtons }, (_, i) => i + 2).map(
      (number) => {
        if (numbersPastMax > 0) {
          return number + numbersPastMax;
        }
        return number;
      }
    );
  }

  const _goToPage = (page: number) => goToPage(paginateFor, page);
  const _nextPage = () => nextPage(paginateFor);
  const _previousPage = () => previousPage(paginateFor);
  const _firstPage = () => firstPage(paginateFor);
  const _lastPage = () => lastPage(paginateFor, lastPageNumber);
  const _setResultsPerPage = (resultsPerPage: number) =>
    setResultsPerPage(paginateFor, resultsPerPage);

  const isActive = (button: number) => button === pageNumber;

  const resultsPerPageOptions = [
    { value: 10, label: "10 results" },
    { value: 20, label: "20 results" },
    { value: 50, label: "50 results" },
  ];

  function getSelectedResultsPerPage() {
    return resultsPerPageOptions.find(
      (option) => option.value === resultsPerPage
    );
  }

  function onSelectResultsPerPage(item: DropdownItemT) {
    _setResultsPerPage(Number(item.value));
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
        {showFirstButton && (
          <PageButton
            onClick={_firstPage}
            disabled={pageNumber === 1}
            $isActive={isActive(1)}
          >
            1
          </PageButton>
        )}
        {buttonNumbers.map((buttonNumber) => (
          <PageButton
            key={buttonNumber}
            onClick={() => _goToPage(buttonNumber)}
            $isActive={isActive(buttonNumber)}
          >
            {buttonNumber}
          </PageButton>
        ))}
        {showLastButton && (
          <>
            <Ellipsis>...</Ellipsis>
            <PageButton
              onClick={_lastPage}
              $isActive={isActive(lastPageNumber)}
            >
              {lastPageNumber}
            </PageButton>
          </>
        )}
        <PreviousPageButton onClick={_previousPage} disabled={pageNumber === 1}>
          <PreviousPage />
        </PreviousPageButton>
        <NextPageButton
          onClick={_nextPage}
          disabled={pageNumber === lastPageNumber}
        >
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

  @media ${mobileAndUnder} {
    flex-direction: column;
    gap: 10px;
    align-items: start;
  }
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
  transition: color 200ms, background 200ms;
`;

const PageButton = styled(BaseButton)<{ $isActive: boolean }>`
  border: 1px solid var(--grey-800);
  color: ${({ $isActive }) => ($isActive ? white : grey800)};
  background: ${({ $isActive }) => ($isActive ? grey800 : "transparent")};
  &:hover {
    ${({ $isActive }) =>
      $isActive ? "" : `background: ${addOpacityToHsl(grey800, 0.1)};`}
  }
`;

const NavigationButton = styled(BaseButton)`
  &:hover {
    background: ${addOpacityToHsl(grey800, 0.1)};
  }
  &:disabled {
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
