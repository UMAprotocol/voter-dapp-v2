import type { AppProps } from "next/app";
import { GlobalStyle } from "components/GlobalStyle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "styles/fonts.css";
import { WalletProvider } from "contexts/WalletContext";
import { PanelProvider } from "contexts/PanelContext";
import { ContractsProvider } from "contexts/ContractsContext";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <ContractsProvider>
          <PanelProvider>
            <GlobalStyle />
            <Component {...pageProps} />
          </PanelProvider>
        </ContractsProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </WalletProvider>
  );
}

export default MyApp;
