import React from "react";
import Head from "next/head";
import { NextComponentType, NextPageContext } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = ({
  Component,
}: {
  Component: NextComponentType<NextPageContext>;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>LLM Lab - Experiment with AI Parameters</title>
        <meta
          name="description"
          content="Experiment with LLM parameters and analyze response quality"
        />
      </Head>
      <Component />
    </QueryClientProvider>
  );
};

export default App;
