import { Vote } from "components";
import type { NextPage } from "next";
import Head from "next/head";

const VotePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>UMA | Voting dApp</title>
      </Head>
      <Vote />
    </>
  );
};

export default VotePage;
