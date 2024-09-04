import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle, Notifications, Panel } from "components";
import {
  ContractsProvider,
  DelegationProvider,
  ErrorProvider,
  NotificationsProvider,
  PanelProvider,
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
                    <PanelProvider>
                      <GlobalStyle />
                      <Component {...pageProps} />
                      <Panel />
                      <Notifications />
                      {config.gaTag && <GoogleAnalytics gaId={config.gaTag} />}
                    </PanelProvider>
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
