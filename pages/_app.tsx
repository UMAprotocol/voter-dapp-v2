import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GlobalStyle } from "components/GlobalStyle";
import { ContractsProvider } from "contexts/ContractsContext";
import { PanelProvider } from "contexts/PanelContext";
import { VotesProvider } from "contexts/VotesContext";
import { VoteTimingProvider } from "contexts/VoteTimingContext";
import { WalletProvider } from "contexts/WalletContext";
import type { AppProps } from "next/app";
import { useState } from "react";
import "styles/fonts.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
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
  );
}

export default MyApp;
