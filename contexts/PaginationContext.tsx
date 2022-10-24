import { createContext, ReactNode, useState } from "react";

export interface PaginationContextState extends PageStatesT {
  goToPage: (paginateFor: PaginateForT, page: number) => void;
  nextPage: (paginateFor: PaginateForT) => void;
  previousPage: (paginateFor: PaginateForT) => void;
  firstPage: (paginateFor: PaginateForT) => void;
  lastPage: (paginateFor: PaginateForT) => void;
}

type PaginateForT = "activeVotesPage" | "upcomingVotesPage" | "pastVotesPage" | "voteHistoryPage";

type PageStateT = {
  number: number;
  resultsPerPage: number;
};

type PageStatesT = Record<PaginateForT, PageStateT>;

const defaultPageState = {
  number: 1,
  resultsPerPage: 5,
};

const defaultPageStates = {
  activeVotesPage: defaultPageState,
  upcomingVotesPage: defaultPageState,
  pastVotesPage: defaultPageState,
  voteHistoryPage: defaultPageState,
};

export const defaultPaginationContextState: PaginationContextState = {
  ...defaultPageStates,
  goToPage: () => null,
  nextPage: () => null,
  previousPage: () => null,
  firstPage: () => null,
  lastPage: () => null,
};

export const PaginationContext = createContext<PaginationContextState>(defaultPaginationContextState);

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [pageStates, setPageStates] = useState<PageStatesT>(defaultPageStates);

  function goToPage(paginateFor: PaginateForT, number: number) {
    setPageStates({ ...pageStates, [paginateFor]: (pageStates[paginateFor].number = number) });
  }

  function nextPage(paginateFor: PaginateForT) {
    setPageStates({ ...pageStates, [paginateFor]: pageStates[paginateFor].number + 1 });
  }

  function previousPage(paginateFor: PaginateForT) {
    setPageStates({ ...pageStates, [paginateFor]: pageStates[paginateFor].number - 1 });
  }

  function firstPage(paginateFor: PaginateForT) {
    goToPage(paginateFor, 1);
  }

  function lastPage(paginateFor: PaginateForT) {
    goToPage(paginateFor, 100);
  }

  return (
    <PaginationContext.Provider
      value={{
        ...pageStates,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}
