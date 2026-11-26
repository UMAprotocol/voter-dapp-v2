import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBanner } from "components/ErrorBanner/ErrorBanner";
import { errorFetchingVoteDataMessage, wrongChainMessage } from "constant";

const state = vi.hoisted(() => ({
  errorMessages: [] as string[],
  errorsShownInActionBar: false,
  isWrongChain: false,
}));
vi.mock("components/EthersErrorLink/EthersErrorLink", () => ({
  EthersErrorLink: ({ errorMessage }: { errorMessage: string }) => errorMessage,
}));
vi.mock("components/ErrorBanner/styles", () => ({
  CloseButton: "button",
  CloseIcon: "svg",
  ErrorMessage: "p",
  ErrorMessageWrapper: "div",
  IconWrapper: "span",
  WarningIcon: "svg",
  Wrapper: "div",
}));
vi.mock("helpers/config", () => ({ config: { properName: "Ethereum" } }));
vi.mock("hooks", () => ({
  useErrorContext: () => ({
    errorMessages: state.errorMessages,
    removeErrorMessage: vi.fn(),
    errorsShownInActionBar: state.errorsShownInActionBar,
  }),
  useWalletContext: () => ({ isWrongChain: state.isWrongChain }),
}));

function render() {
  return renderToStaticMarkup(React.createElement(ErrorBanner));
}

beforeEach(() => {
  state.errorMessages = [errorFetchingVoteDataMessage, "Transaction failed"];
  state.errorsShownInActionBar = false;
  state.isWrongChain = false;
});

describe("ErrorBanner", () => {
  it("shows every error when the action bar isn't on screen", () => {
    const html = render();
    expect(html).toContain(errorFetchingVoteDataMessage);
    expect(html).toContain("Transaction failed");
  });

  it("keeps only data fetching errors while the action bar shows the rest", () => {
    state.errorsShownInActionBar = true;
    const html = render();
    expect(html).toContain(errorFetchingVoteDataMessage);
    expect(html).not.toContain("Transaction failed");
  });

  it("leaves the wrong chain message to the action bar", () => {
    state.isWrongChain = true;
    expect(render()).toContain(wrongChainMessage);

    state.errorsShownInActionBar = true;
    state.errorMessages = ["Transaction failed"];
    expect(render()).toBe("");
  });
});
