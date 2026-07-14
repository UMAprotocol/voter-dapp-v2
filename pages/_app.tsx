import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  GlobalStyle,
  Notifications,
  Panel,
  VoteDeeplinkHandler,
} from "components";
import {
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
  NotificationsProvider,
  PanelProvider,
  VoteSelectionProvider,
  VoteTimingProvider,
  VotesProvider,
  WalletProvider,
} from "contexts";
import type { AppProps } from "next/app";
import "styles/fonts.css";
import "styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { config } from "helpers";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorProvider>
      <NotificationsProvider>
        <VoteTimingProvider>
          <QueryClientProvider client={queryClient}>
            <WalletProvider>
              <ContractsProvider>
                <DelegationProvider>
                  <VotesProvider>
                    <VoteSelectionProvider>
                      <PanelProvider>
                        <GlobalStyle />
                        <Component {...pageProps} />
                        <Panel />
                        <VoteDeeplinkHandler />
                        <Notifications />
                        {config.gaTag && (
                          <GoogleAnalytics gaId={config.gaTag} />
                        )}
                      </PanelProvider>
                    </VoteSelectionProvider>
                  </VotesProvider>
                </DelegationProvider>
              </ContractsProvider>
              <ReactQueryDevtools />
            </WalletProvider>
          </QueryClientProvider>
        </VoteTimingProvider>
      </NotificationsProvider>
    </ErrorProvider>
  );
}

export default MyApp;
