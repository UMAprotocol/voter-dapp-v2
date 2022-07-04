import type { AppProps } from "next/app";
import { GlobalStyle } from "components/GlobalStyle";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import "styles/fonts.css";
import { WalletProvider } from "contexts/WalletContext";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <Component {...pageProps} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </WalletProvider>
  );
}

export default MyApp;
