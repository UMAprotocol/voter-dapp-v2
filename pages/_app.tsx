import type { AppProps } from "next/app";
import { GlobalStyle } from "components/GlobalStyle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "styles/fonts.css";
import { WalletProvider } from "contexts/WalletContext";
import { PanelProvider } from "contexts/PanelContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
        console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
      }),
        (err: any) => {
          console.log(`ServiceWorker registration failed: ${err}`);
        };
    }
  });
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
    }
  });
  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <PanelProvider>
          <GlobalStyle />
          <Component {...pageProps} />
        </PanelProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </WalletProvider>
  );
}

export default MyApp;
