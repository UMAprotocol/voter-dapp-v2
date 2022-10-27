import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle } from "components";
import {
  BalancesProvider,
  ContractsProvider,
  ErrorProvider,
  NotificationsProvider,
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
      <NotificationsProvider>
        <VoteTimingProvider>
          <WalletProvider>
            <QueryClientProvider client={queryClient}>
              <UserProvider>
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
              </UserProvider>
            </QueryClientProvider>
          </WalletProvider>
        </VoteTimingProvider>
      </NotificationsProvider>
    </ErrorProvider>
  );
}

export default MyApp;
