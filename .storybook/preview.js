import { addDecorator } from "@storybook/react";
import { GlobalStyle } from 'components/GlobalStyle';
import { WalletProvider } from "contexts/WalletContext";
import { QueryClientProvider, QueryClient } from "react-query";
import { PanelProvider } from "contexts/PanelContext";

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