import { Decorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { GlobalStyle } from "../components/GlobalStyle";
import {
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
  PaginationProvider,
  PanelProvider,
  StakingProvider,
  UserProvider,
  VotesProvider,
  VoteTimingProvider,
  WalletProvider,
} from "../contexts";
import "../styles/fonts.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const queryClient = new QueryClient();

export const decorators: Decorator[] = [
  (Story) => (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <VoteTimingProvider>
          <WalletProvider>
            <UserProvider>
              <ContractsProvider>
                <StakingProvider>
                  <PaginationProvider>
                    <DelegationProvider>
                      <VotesProvider>
                        <PanelProvider>
                          <GlobalStyle />
                          <Story />
                        </PanelProvider>
                      </VotesProvider>
                    </DelegationProvider>
                  </PaginationProvider>
                </StakingProvider>
              </ContractsProvider>
            </UserProvider>
          </WalletProvider>
        </VoteTimingProvider>
      </QueryClientProvider>
    </ErrorProvider>
  ),
];
