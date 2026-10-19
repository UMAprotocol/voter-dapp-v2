import { createElement, EffectCallback } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVoteDeeplink } from "hooks/helpers/useVoteDeeplink";
import { VoteT } from "types";

const state = vi.hoisted(() => ({
  effects: [] as EffectCallback[],
  panelVote: undefined as VoteT | undefined,
  listVote: {} as VoteT,
  showVote: vi.fn(),
  requestVoteScroll: vi.fn(),
  replace: vi.fn(),
}));

// Run the real hook's effects after rendering without needing a browser.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useEffect: (effect: EffectCallback) => state.effects.push(effect),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({}),
  useQueryClient: () => ({ setQueryData: vi.fn() }),
}));
vi.mock("helpers", () => ({ emitErrorEvent: vi.fn() }));
vi.mock("helpers/voting/makeProvisionalVote", () => ({
  makeProvisionalVote: vi.fn(),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({
    isReady: true,
    query: { vote: "reveal-vote" },
    pathname: "/",
    replace: state.replace,
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));
vi.mock("hooks/contexts/usePanelContext", () => ({
  usePanelContext: () => ({
    panelType: "vote",
    panelContent: state.panelVote,
    panelOpen: true,
    showVote: state.showVote,
    expectedVoteRef: { current: undefined },
    requestVoteScroll: state.requestVoteScroll,
  }),
}));
vi.mock("hooks/contexts/useVotesContext", () => ({
  useVotesContext: () => ({
    voteListsByActivityStatus: {
      active: [state.listVote],
      upcoming: [],
      past: [],
    },
    activeVotesIsInitialLoading: false,
    upcomingVotesIsInitialLoading: false,
    pastVotesIsInitialLoading: false,
  }),
}));
vi.mock("hooks/queries/votes/useVotesWithOnScreenData", () => ({
  useVotesWithOnScreenData: (votes: VoteT[]) => votes,
}));
vi.mock("hooks/queries/votes/useVotesWithResolvedAncillaryData", () => ({
  useAncillaryDataResolutionErrored: () => false,
}));

function syncPanel() {
  function Harness() {
    useVoteDeeplink();
    return null;
  }
  renderToString(createElement(Harness));
  const cleanups = state.effects.splice(0).map((effect) => effect());
  cleanups.forEach((cleanup) => cleanup?.());
}

beforeEach(() => {
  vi.clearAllMocks();
  state.effects = [];
  state.panelVote = {
    uniqueKey: "reveal-vote",
    decodedAncillaryData: "question",
    ancillaryDataL2: "0x1234",
    results: [],
  } as unknown as VoteT;
  state.listVote = state.panelVote;
  state.showVote.mockImplementation((vote: VoteT) => {
    state.panelVote = vote;
  });
});

describe("useVoteDeeplink live panel data", () => {
  it("makes results available to the open panel when reveals arrive", () => {
    syncPanel();
    expect(state.showVote).not.toHaveBeenCalled();

    state.listVote = {
      ...state.listVote,
      results: [{ vote: "1", tokensVotedWith: 100 }],
    };
    syncPanel();

    expect(state.panelVote?.results).toEqual(state.listVote.results);
    expect(state.requestVoteScroll).not.toHaveBeenCalled();
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("refreshes participation even when the result groups are unchanged", () => {
    state.listVote = {
      ...state.listVote,
      participation: {
        uniqueCommitAddresses: 2,
        uniqueRevealAddresses: 1,
        totalTokensVotedWith: 100,
        totalTokensCommitted: 200,
      },
    };
    syncPanel();

    expect(state.panelVote?.participation).toEqual(
      state.listVote.participation
    );
    expect(state.requestVoteScroll).not.toHaveBeenCalled();
  });

  it("does not repeatedly replace the panel after results are synchronized", () => {
    state.listVote = {
      ...state.listVote,
      results: [{ vote: "1", tokensVotedWith: 100 }],
    };
    syncPanel();
    expect(state.showVote).toHaveBeenCalledTimes(1);

    // List enrichment can produce a new vote object with the same cached data.
    state.listVote = { ...state.listVote };
    syncPanel();
    expect(state.showVote).toHaveBeenCalledTimes(1);
  });
});
