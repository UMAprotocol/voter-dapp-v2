import { createContext, ReactNode, useState } from "react";
import { PageStatesT, PaginateForT } from "types/global";

export interface PaginationContextState {
  pageStates: PageStatesT;
  goToPage: (paginateFor: PaginateForT, page: number) => void;
  nextPage: (paginateFor: PaginateForT) => void;
  previousPage: (paginateFor: PaginateForT) => void;
  firstPage: (paginateFor: PaginateForT) => void;
  setResultsPerPage: (paginateFor: PaginateForT, resultsPerPage: number) => void;
}

export const defaultPageState = {
  number: 1,
  resultsPerPage: 5,
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
  setResultsPerPage: () => null,
};

export const PaginationContext = createContext<PaginationContextState>(defaultPaginationContextState);

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [pageStates, setPageStates] = useState<PageStatesT>(defaultPageStates);

  function goToPage(paginateFor: PaginateForT, number: number) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].number = number;
      return newState;
    });
  }

  function nextPage(paginateFor: PaginateForT) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].number += 1;
      return newState;
    });
  }

  function previousPage(paginateFor: PaginateForT) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].number -= 1;
      return newState;
    });
  }

  function firstPage(paginateFor: PaginateForT) {
    goToPage(paginateFor, 1);
  }

  function setResultsPerPage(paginateFor: PaginateForT, resultsPerPage: number) {
    setPageStates((prev) => {
      const newState = { ...prev };
      newState[paginateFor].resultsPerPage = resultsPerPage;
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
        setResultsPerPage,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}
