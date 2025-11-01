import React from "react";
import Head from "next/head";
import { NextComponentType, NextPageContext } from "next";
import "@/styles/globals.css";

const App = ({
  Component,
}: {
  Component: NextComponentType<NextPageContext>;
}) => {
  return (
    <>
      <Head>
        <title>LLM Challenge</title>
      </Head>
      <Component />
    </>
  );
};

export default App;
