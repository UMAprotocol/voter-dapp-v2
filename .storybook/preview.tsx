import { addDecorator } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "styles/fonts.css";
import { GlobalStyle } from "../components/GlobalStyle";
import { PanelProvider, WalletProvider } from "../contexts";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

addDecorator((Story) => (
  <WalletProvider>
    <QueryClientProvider client={new QueryClient()}>
      <PanelProvider>
        <GlobalStyle />
        <Story />
      </PanelProvider>
    </QueryClientProvider>
  </WalletProvider>
));
