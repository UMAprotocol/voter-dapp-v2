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
  VoteTimingProvider,
  VotesProvider,
  WalletProvider,
} from "../contexts";
import { date } from "../stories/mocks/misc";
import "../styles/fonts.css";
import "../styles/globals.css";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    defaultViewport: "desktop",
    viewports: {
      smallMobile: {
        name: "Small Mobile",
        styles: {
          height: "100%",
          width: "320px",
        },
        type: "mobile",
      },
      largeMobile: {
        name: "Large Mobile",
        styles: {
          height: "100%",
          width: "640px",
        },
        type: "mobile",
      },
      tablet: {
        name: "Tablet",
        styles: {
          height: "100%",
          width: "1024px",
        },
        type: "tablet",
      },
      laptop: {
        name: "Laptop",
        styles: {
          height: "100%",
          width: "1300px",
        },
        type: "desktop",
      },
      desktop: {
        name: "Desktop",
        styles: {
          height: "100%",
          width: "100%",
        },
        type: "desktop",
      },
    },
  },
  defaultViewport: "mobile",
  layout: "fullscreen",
  chromatic: {
    viewports: [320, 550, 1000, 1500, 1920],
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
            <ContractsProvider>
              <DelegationProvider>
                <VotesProvider>
                  <PanelProvider>
                    <GlobalStyle />
                    <Story />
                  </PanelProvider>
                </VotesProvider>
              </DelegationProvider>
            </ContractsProvider>
          </WalletProvider>
        </VoteTimingProvider>
      </QueryClientProvider>
    </ErrorProvider>
  ),
];
