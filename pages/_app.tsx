import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle } from "components/GlobalStyle";
import {
  BalancesProvider,
  ContractsProvider,
  ErrorProvider,
  PanelProvider,
  VotesProvider,
  VoteTimingProvider,
  WalletProvider,
} from "contexts";
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
              <BalancesProvider>
                <VotesProvider>
                  <PanelProvider>
                    <GlobalStyle />
                    <Component {...pageProps} />
                  </PanelProvider>
                </VotesProvider>
              </BalancesProvider>
            </ContractsProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </WalletProvider>
      </VoteTimingProvider>
    </ErrorProvider>
  );
}

export default MyApp;
