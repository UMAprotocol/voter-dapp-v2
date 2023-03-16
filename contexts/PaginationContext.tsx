import { defaultResultsPerPage } from "constant";
import { createContext, ReactNode, useState } from "react";
import { PageStatesT, PaginateForT } from "types";

export interface PaginationContextState {
  pageStates: PageStatesT;
  goToPage: (paginateFor: PaginateForT, page: number) => void;
  nextPage: (paginateFor: PaginateForT) => void;
  previousPage: (paginateFor: PaginateForT) => void;
  firstPage: (paginateFor: PaginateForT) => void;
  lastPage: (paginateFor: PaginateForT, lastPageNumber: number) => void;
  setResultsPerPage: (
    paginateFor: PaginateForT,
    resultsPerPage: number
  ) => void;
}

export const defaultPageState = {
  pageNumber: 1,
  resultsPerPage: defaultResultsPerPage,
};

export const defaultPageStates = {
  activeVotesPage: defaultPageState,
  upcomingVotesPage: defaultPageState,
  pastVotesPage: defaultPageState,
  pastVotesComponent: defaultPageState,
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

export const PaginationContext = createContext<PaginationContextState>(
  defaultPaginationContextState
);

export function PaginationProvider({ children }: { children: ReactNode }) {
  const [activeVotesPage, setActiveVotesPage] = useState({
    ...defaultPageState,
  });
  const [upcomingVotesPage, setUpcomingVotesPage] = useState({
    ...defaultPageState,
  });
  const [pastVotesPage, setPastVotesPage] = useState({ ...defaultPageState });
  const [pastVotesComponent, setPastVotesComponent] = useState({
    ...defaultPageState,
  });
  const [voteHistoryPage, setVoteHistoryPage] = useState({
    ...defaultPageState,
  });
  const pageStates = {
    activeVotesPage,
    upcomingVotesPage,
    pastVotesPage,
    pastVotesComponent,
    voteHistoryPage,
  };

  const setterFunctions = {
    activeVotesPage: setActiveVotesPage,
    upcomingVotesPage: setUpcomingVotesPage,
    pastVotesPage: setPastVotesPage,
    pastVotesComponent: setPastVotesComponent,
    voteHistoryPage: setVoteHistoryPage,
  };

  function goToPage(paginateFor: PaginateForT, number: number) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      pageNumber: number,
    }));
  }

  function nextPage(paginateFor: PaginateForT) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      pageNumber: prevState.pageNumber + 1,
    }));
  }

  function previousPage(paginateFor: PaginateForT) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      pageNumber: prevState.pageNumber - 1,
    }));
  }

  function setResultsPerPage(
    paginateFor: PaginateForT,
    resultsPerPage: number
  ) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      resultsPerPage,
    }));
  }

  function firstPage(paginateFor: PaginateForT) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      pageNumber: 1,
    }));
  }

  function lastPage(paginateFor: PaginateForT, lastPageNumber: number) {
    setterFunctions[paginateFor]((prevState) => ({
      ...prevState,
      pageNumber: lastPageNumber,
    }));
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
