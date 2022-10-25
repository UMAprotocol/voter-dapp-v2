import { createContext, ReactNode, useState } from "react";
import { PageStatesT, PaginateForT } from "types/global";

export interface PaginationContextState {
  pageStates: PageStatesT;
  goToPage: (paginateFor: PaginateForT, page: number) => void;
  nextPage: (paginateFor: PaginateForT) => void;
  previousPage: (paginateFor: PaginateForT) => void;
  firstPage: (paginateFor: PaginateForT) => void;
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
};

export const PaginationContext = createContext<PaginationContextState>(defaultPaginationContextState);

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [pageStates, setPageStates] = useState<PageStatesT>(defaultPageStates);

  function goToPage(paginateFor: PaginateForT, number: number) {
    setPageStates({ ...pageStates, [paginateFor]: (pageStates[paginateFor].number = number) });
  }

  function nextPage(paginateFor: PaginateForT) {
    setPageStates({
      ...pageStates,
      [paginateFor]: (pageStates[paginateFor].number = pageStates[paginateFor].number + 1),
    });
  }

  function previousPage(paginateFor: PaginateForT) {
    setPageStates({
      ...pageStates,
      [paginateFor]: (pageStates[paginateFor].number = pageStates[paginateFor].number - 1),
    });
  }

  function firstPage(paginateFor: PaginateForT) {
    goToPage(paginateFor, 1);
  }

  return (
    <PaginationContext.Provider
      value={{
        pageStates,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
}
