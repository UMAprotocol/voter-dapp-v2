import { PastVotes } from "components";
import type { NextPage } from "next";
import Head from "next/head";

const PastVotesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>UMA | Past Votes</title>
      </Head>
      <PastVotes />
    </>
  );
};

export default PastVotesPage;
