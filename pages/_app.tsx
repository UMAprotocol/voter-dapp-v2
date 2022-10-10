import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle, Panel } from "components";
import {
  BalancesProvider,
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
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
          <QueryClientProvider client={queryClient}>
            <UserProvider>
              <ContractsProvider>
                <DelegationProvider>
                  <BalancesProvider>
                    <VotesProvider>
                      <PanelProvider>
                        <GlobalStyle />
                        <Component {...pageProps} />
                        <Panel />
                      </PanelProvider>
                    </VotesProvider>
                  </BalancesProvider>
                </DelegationProvider>
              </ContractsProvider>
              <ReactQueryDevtools />
            </UserProvider>
          </QueryClientProvider>
        </WalletProvider>
      </VoteTimingProvider>
    </ErrorProvider>
  );
}

export default MyApp;
