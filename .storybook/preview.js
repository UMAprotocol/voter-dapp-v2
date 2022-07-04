import { addDecorator } from "@storybook/react";
import { GlobalStyle } from 'components/GlobalStyle';
import { WalletProvider } from "contexts/WalletContext";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

addDecorator((story) => (
  <WalletProvider>
    <GlobalStyle />
    {story()}
  </WalletProvider>
));