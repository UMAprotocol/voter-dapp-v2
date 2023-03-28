import { Decorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { mockDateDecorator } from "storybook-mock-date-decorator";
import { GlobalStyle } from "../components/GlobalStyle";
import {
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
  PanelProvider,
  StakingProvider,
  UserProvider,
  VotesProvider,
  VoteTimingProvider,
  WalletProvider,
} from "../contexts";
import { mockDate } from "../stories/mocks/misc";
import "../styles/fonts.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  date: mockDate,
};

const queryClient = new QueryClient();

export const decorators: Decorator[] = [
  mockDateDecorator,
  (Story) => (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <VoteTimingProvider>
          <WalletProvider>
            <UserProvider>
              <ContractsProvider>
                <StakingProvider>
                  <DelegationProvider>
                    <VotesProvider>
                      <PanelProvider>
                        <GlobalStyle />
                        <Story />
                      </PanelProvider>
                    </VotesProvider>
                  </DelegationProvider>
                </StakingProvider>
              </ContractsProvider>
            </UserProvider>
          </WalletProvider>
        </VoteTimingProvider>
      </QueryClientProvider>
    </ErrorProvider>
  ),
];
