import { Dropdown } from "components";
import {
  defaultResultsPerPage,
  grey800,
  mobileAndUnder,
  white,
} from "constant";
import { addOpacityToHsl } from "helpers";
import PreviousPage from "public/assets/icons/left-chevron.svg";
import NextPage from "public/assets/icons/right-chevron.svg";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props<Entry> {
  entries: Entry[];
  setEntriesToShow: (entries: Entry[]) => void;
}
/**
 * Handles pagination for a list of entries
 * @param entries - the entries to paginate (not the entries to show)
 * @param setEntriesToShow - the function to call when the entries to show change
 */
export function Pagination<Entry>({ entries, setEntriesToShow }: Props<Entry>) {
  const [pageNumber, setPageNumber] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(defaultResultsPerPage);
  const numberOfEntries = entries.length;
  const numberOfPages = Math.ceil(numberOfEntries / resultsPerPage);
  const lastPageNumber = numberOfPages;
  const defaultNumberOfButtons = 4;
  const numberOfButtons = getNumberOfButtons();
  const hasMorePagesThanButtons = numberOfPages > numberOfButtons;
  const numbersPastMax = pageNumber - numberOfButtons;
  const isLastNumbers = 2 * numberOfButtons + numbersPastMax > numberOfPages;
  const isFirstNumbers = numbersPastMax <= 0;
  const showFirstButton = hasMorePagesThanButtons;
  const showLastButton =
    hasMorePagesThanButtons &&
    !isLastNumbers &&
    lastPageNumber - 1 !== numberOfButtons;
  const buttonNumbers = makeButtonNumbers();

  useEffect(() => {
    updateEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  function getNumberOfButtons() {
    if (numberOfPages === defaultNumberOfButtons + 1) {
      return defaultNumberOfButtons + 1;
    }
    if (numberOfPages < defaultNumberOfButtons) {
      return numberOfPages;
    }
    return defaultNumberOfButtons;
  }

  function makeButtonNumbers() {
    if (!hasMorePagesThanButtons) {
      return Array.from({ length: numberOfPages }, (_, i) => i + 1);
    }

    if (isLastNumbers) {
      return Array.from(
        { length: numberOfButtons + 1 },
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

  function updateEntriesForPageNumber(newPageNumber: number) {
    updateEntries({ newPageNumber });
  }

  function updateResultsPerPage(newResultsPerPage: number) {
    setResultsPerPage(newResultsPerPage);
    const newPageNumber = Math.ceil(
      (pageNumber * resultsPerPage) / newResultsPerPage
    );
    updateEntries({ newPageNumber, newResultsPerPage });
    setPageNumber(newPageNumber);
  }

  function updateEntries(params?: {
    newPageNumber?: number;
    newResultsPerPage?: number;
  }) {
    const newPageNumber = params?.newPageNumber ?? pageNumber;
    const newResultsPerPage = params?.newResultsPerPage ?? resultsPerPage;

    setEntriesToShow(getEntriesForPage({ newPageNumber, newResultsPerPage }));
  }

  function getEntriesForPage({
    newPageNumber = pageNumber,
    newResultsPerPage = resultsPerPage,
  }: {
    newPageNumber?: number;
    newResultsPerPage?: number;
  }) {
    const startIndex = (newPageNumber - 1) * newResultsPerPage;
    const endIndex = startIndex + newResultsPerPage;
    return entries.slice(startIndex, endIndex);
  }

  function isActive(buttonNumber: number) {
    return buttonNumber === pageNumber;
  }

  function goToPage(number: number) {
    setPageNumber(number);
    updateEntriesForPageNumber(number);
  }

  function nextPage() {
    const newPageNumber = pageNumber + 1;
    setPageNumber(newPageNumber);
    updateEntriesForPageNumber(newPageNumber);
  }

  function prevPage() {
    const newPageNumber = pageNumber - 1;
    setPageNumber(newPageNumber);
    updateEntriesForPageNumber(newPageNumber);
  }

  function firstPage() {
    setPageNumber(1);
    updateEntriesForPageNumber(1);
  }

  function lastPage() {
    setPageNumber(lastPageNumber);
    updateEntriesForPageNumber(lastPageNumber);
  }

  const resultsPerPageOptions = [
    { value: 10, label: "10 results" },
    { value: 20, label: "20 results" },
    { value: 50, label: "50 results" },
  ];

  function getSelectedResultsPerPage() {
    return (
      resultsPerPageOptions.find((option) => option.value === resultsPerPage) ??
      resultsPerPageOptions[0]
    );
  }

  return (
    <Wrapper>
      <ResultsPerPageWrapper>
        <Dropdown
          items={resultsPerPageOptions}
          selected={getSelectedResultsPerPage()}
          onSelect={(option) => updateResultsPerPage(Number(option.value))}
          textColor={grey800}
          borderColor={grey800}
          label="Results per page"
        />
      </ResultsPerPageWrapper>
      <ButtonsWrapper>
        {showFirstButton && (
          <>
            <PageButton
              onClick={firstPage}
              disabled={pageNumber === 1}
              $isActive={isActive(1)}
            >
              1
            </PageButton>
            {!isFirstNumbers && <Ellipsis>...</Ellipsis>}
          </>
        )}
        {buttonNumbers.map((buttonNumber) => (
          <PageButton
            key={buttonNumber}
            onClick={() => goToPage(buttonNumber)}
            $isActive={isActive(buttonNumber)}
          >
            {buttonNumber}
          </PageButton>
        ))}
        {showLastButton && (
          <>
            <Ellipsis>...</Ellipsis>
            <PageButton onClick={lastPage} $isActive={isActive(lastPageNumber)}>
              {lastPageNumber}
            </PageButton>
          </>
        )}
        <PreviousPageButton onClick={prevPage} disabled={pageNumber === 1}>
          <PreviousPage />
        </PreviousPageButton>
        <NextPageButton
          onClick={nextPage}
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
    gap: 8px;
    align-items: start;
  }
`;

const ResultsPerPageWrapper = styled.div`
  min-width: 120px;
`;

const ButtonsWrapper = styled.nav`
  display: flex;
  gap: min(8px, 1vw);
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
`;
