import React, { useState } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import "@/styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="Experiment with LLM parameters and analyze response quality. Compare different parameter combinations to find the best settings."
          />
          <meta
            name="keywords"
            content="LLM, AI, experiment, parameters, Gemini, testing"
          />
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default App;
