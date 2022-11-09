import { WalletSettings } from "components";
import type { NextPage } from "next";
import Head from "next/head";

const WalletSettingsPage: NextPage = () => {
  return (
    <>
      <Head>UMA | Wallet Settings</Head>
      <WalletSettings />
    </>
  );
};

export default WalletSettingsPage;
