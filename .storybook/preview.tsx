import { addDecorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "styles/fonts.css";
import { GlobalStyle } from "../components/GlobalStyle";
import { Panel } from "../components/Panel/Panel";
import { ContractsProvider, DelegationProvider, ErrorProvider, PaginationProvider, PanelProvider, StakingProvider, UserProvider, VotesProvider, VoteTimingProvider, WalletProvider } from "../contexts";

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

addDecorator((Story) => (
  <ErrorProvider>
      <VoteTimingProvider>
        <WalletProvider>
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <ContractsProvider>
                <StakingProvider>
                  <DelegationProvider>
                    <VotesProvider>
                    <PanelProvider>
                      <PaginationProvider />
                        <GlobalStyle />
                        <Story />
                        <Panel />
                      </PanelProvider>
                    </VotesProvider>
                  </DelegationProvider>
                </StakingProvider>
              </ContractsProvider>
            </UserProvider>
          </QueryClientProvider>
        </WalletProvider>
      </VoteTimingProvider>
    </ErrorProvider>
));
