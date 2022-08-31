import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle } from "components/GlobalStyle";
import { ContractsProvider } from "contexts/ContractsContext";
import { PanelProvider } from "contexts/PanelContext";
import { VoteTimingProvider } from "contexts/VoteTimingContext";
import { WalletProvider } from "contexts/WalletContext";
import type { AppProps } from "next/app";
import "styles/fonts.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <VoteTimingProvider>
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
    </VoteTimingProvider>
  );
}

export default MyApp;
