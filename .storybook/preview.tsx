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
  VoteTimingProvider,
  VotesProvider,
  WalletProvider,
} from "../contexts";
import { date } from "../stories/mocks/misc";
import "../styles/fonts.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  date,
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
