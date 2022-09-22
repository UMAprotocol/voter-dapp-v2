import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle } from "components/GlobalStyle";
import { ContractsProvider } from "contexts/ContractsContext";
import { ErrorProvider } from "contexts/ErrorContext";
import { PanelProvider } from "contexts/PanelContext";
import { VotesProvider } from "contexts/VotesContext";
import { VoteTimingProvider } from "contexts/VoteTimingContext";
import { WalletProvider } from "contexts/WalletContext";
import type { AppProps } from "next/app";
import "styles/fonts.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorProvider>
      <VoteTimingProvider>
        <WalletProvider>
          <QueryClientProvider client={queryClient}>
            <ContractsProvider>
              <VotesProvider>
                <PanelProvider>
                  <GlobalStyle />
                  <Component {...pageProps} />
                </PanelProvider>
              </VotesProvider>
            </ContractsProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </WalletProvider>
      </VoteTimingProvider>
    </ErrorProvider>
  );
}

export default MyApp;
