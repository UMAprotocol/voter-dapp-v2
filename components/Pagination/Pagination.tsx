import { Dropdown } from "components/Dropdown";
import { grey800, white } from "constants/colors";
import { addOpacityToHsl } from "helpers";
import { usePaginationContext } from "hooks/contexts/usePaginationContext";
import PreviousPage from "public/assets/icons/left-chevron.svg";
import NextPage from "public/assets/icons/right-chevron.svg";
import styled, { CSSProperties } from "styled-components";
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
    { value: 5, label: "5 results" },
    { value: 20, label: "20 results" },
    { value: 50, label: "50 results" },
  ];

  function getSelectedResultsPerPage() {
    return resultsPerPageOptions.find((option) => option.value === pageState.resultsPerPage);
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
        {buttonNumbers.map((buttonNumber) => (
          <PageButton
            key={buttonNumber}
            onClick={() => _goToPage(buttonNumber)}
            style={
              {
                "--color": isActive(buttonNumber) ? white : grey800,
                "--background-color": isActive(buttonNumber) ? grey800 : "transparent",
              } as CSSProperties
            }
          >
            {buttonNumber}
          </PageButton>
        ))}
        <PreviousPageButton onClick={_previousPage} disabled={pageState.number === 1}>
          <PreviousPage />
        </PreviousPageButton>
        <NextPageButton onClick={_nextPage}>
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
