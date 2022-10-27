import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle, Panel } from "components";
import {
  BalancesProvider,
  ContractsProvider,
  ErrorProvider,
  NotificationsProvider,
  PaginationProvider,
  PanelProvider,
  UserProvider,
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
          <PaginationProvider>
            <QueryClientProvider client={queryClient}>
              <UserProvider>
                <ContractsProvider>
                  <BalancesProvider>
                    <VotesProvider>
                      <PanelProvider>
                        <GlobalStyle />
                        <Component {...pageProps} />
                        <Panel />
                      </PanelProvider>
                    </VotesProvider>
                  </BalancesProvider>
                </ContractsProvider>
                <ReactQueryDevtools />
              </UserProvider>
            </QueryClientProvider>
          </PaginationProvider>
        </WalletProvider>
      </VoteTimingProvider>
    </ErrorProvider>
  );
}

export default MyApp;
