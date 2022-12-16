import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle, Notifications, Panel } from "components";
import {
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
  NotificationsProvider,
  PaginationProvider,
  PanelProvider,
  StakingProvider,
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
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <UserProvider>
                <ContractsProvider>
                  <PaginationProvider>
                    <DelegationProvider>
                      <StakingProvider>
                        <VotesProvider>
                          <PanelProvider>
                            <GlobalStyle />
                            <Component {...pageProps} />
                            <Panel />
                            <Notifications />
                          </PanelProvider>
                        </VotesProvider>
                      </StakingProvider>
                    </DelegationProvider>
                  </PaginationProvider>
                </ContractsProvider>
                <ReactQueryDevtools />
              </UserProvider>
            </WalletProvider>
          </QueryClientProvider>
        </VoteTimingProvider>
      </NotificationsProvider>
    </ErrorProvider>
  );
}

export default MyApp;
