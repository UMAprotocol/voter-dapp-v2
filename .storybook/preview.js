import { addDecorator } from "@storybook/react";
import { GlobalStyle } from 'components/GlobalStyle';
import { WalletProvider } from "contexts/WalletContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PanelProvider } from "contexts/PanelContext";
import "styles/fonts.css";
import { Buffer } from "buffer";

window.Buffer = Buffer;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

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