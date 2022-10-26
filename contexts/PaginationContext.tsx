import { createContext, ReactNode, useState } from "react";
import { PageStatesT, PaginateForT } from "types";

export interface PaginationContextState {
  pageStates: PageStatesT;
  goToPage: (paginateFor: PaginateForT, page: number) => void;
  nextPage: (paginateFor: PaginateForT) => void;
  previousPage: (paginateFor: PaginateForT) => void;
  firstPage: (paginateFor: PaginateForT) => void;
  lastPage: (paginateFor: PaginateForT, lastPageNumber: number) => void;
  setResultsPerPage: (paginateFor: PaginateForT, resultsPerPage: number) => void;
}

export const defaultPageState = {
  pageNumber: 1,
  resultsPerPage: 20,
};

export const defaultPageStates = {
  activeVotesPage: defaultPageState,
  upcomingVotesPage: defaultPageState,
  pastVotesPage: defaultPageState,
  voteHistoryPage: defaultPageState,
};

export const defaultPaginationContextState: PaginationContextState = {
  pageStates: defaultPageStates,
  goToPage: () => null,
  nextPage: () => null,
  previousPage: () => null,
  firstPage: () => null,
  lastPage: () => null,
  setResultsPerPage: () => null,
};

export const PaginationContext = createContext<PaginationContextState>(defaultPaginationContextState);

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [pageStates, setPageStates] = useState<PageStatesT>(defaultPageStates);

  function goToPage(paginateFor: PaginateForT, number: number) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].pageNumber = number;
      return newState;
    });
  }

  function nextPage(paginateFor: PaginateForT) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].pageNumber += 1;
      return newState;
    });
  }

  function previousPage(paginateFor: PaginateForT) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].pageNumber -= 1;
      return newState;
    });
  }

  function setResultsPerPage(paginateFor: PaginateForT, resultsPerPage: number) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].resultsPerPage = resultsPerPage;
      return newState;
    });
  }

  function firstPage(paginateFor: PaginateForT) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].pageNumber = 1;
      return newState;
    });
  }

  function lastPage(paginateFor: PaginateForT, lastPageNumber: number) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].pageNumber = lastPageNumber;
      return newState;
    });
  }

  return (
    <PaginationContext.Provider
      value={{
        pageStates,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        setResultsPerPage,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}
