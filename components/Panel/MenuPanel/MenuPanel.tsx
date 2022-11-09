import { useConnectWallet } from "@web3-onboard/react";
import { Button, Nav, WalletIcon } from "components";
import { mobileAndUnder } from "constant";
import { handleDisconnectWallet, truncateEthAddress } from "helpers";
import { useDelegationContext, useUserContext, useWalletContext } from "hooks";
import NextLink from "next/link";
import LinkedAddress from "public/assets/icons/link.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled from "styled-components";
import { PanelFooter } from "../PanelFooter";
import { PanelWrapper } from "../styles";

export function MenuPanel() {
  const [_wallets, connect, disconnect] = useConnectWallet();
  const { setSigner, setProvider } = useWalletContext();
  const { address, connectedWallet, walletIcon } = useUserContext();
  const {
    getDelegationStatus,
    getDelegateAddress,
    getDelegatorAddress,
    getPendingSentRequestsToBeDelegate,
    getPendingReceivedRequestsToBeDelegate,
  } = useDelegationContext();

  const links = [
    {
      title: "Vote",
      href: "/",
    },
    {
      title: "Past Votes",
      href: "/past-votes",
    },
    {
      title: "Wallet Settings",
      href: "/wallet-settings",
    },
    {
      title: "Optimistic Oracle",
      href: "https://oracle.umaproject.org",
    },
    {
      title: "Docs",
      href: "https://docs.umaproject.org",
    },
  ];

  const _links = connectedWallet
    ? links
    : links.filter((link) => link.href !== "/wallet-settings");

  const status = getDelegationStatus();

  const isDelegator = status === "delegator";
  const isDelegate = status === "delegate";
  const isDelegatorPending = status === "delegator-pending";
  const isDelegatePending = status === "delegate-pending";

  const walletTitle = isDelegator
    ? "Delegator Wallet"
    : isDelegate
    ? "Delegate Wallet"
    : "Your Wallet";

  const showOtherWallet = isDelegator || isDelegate;
  const otherWalletTitle = isDelegator ? "Delegate Wallet" : "Delegator Wallet";
  const otherWalletAddress = isDelegator
    ? getDelegateAddress()
    : getDelegatorAddress();

  const showPending = isDelegatorPending || isDelegatePending;
  const pendingRequests = isDelegatorPending
    ? getPendingSentRequestsToBeDelegate()
    : getPendingReceivedRequestsToBeDelegate();
  const pendingRequestLinkText = isDelegatorPending
    ? "Sent request"
    : "Received request";
  const toOrFrom = isDelegatorPending ? "to" : "from";

  function getPendingRequestAddress(delegator: string, delegate: string) {
    return isDelegatorPending ? delegate : delegator;
  }

  return (
    <PanelWrapper>
      <OuterWrapper>
        <AccountWrapper>
          <Title>Account</Title>
          {connectedWallet ? (
            <>
              <WalletHeader>
                {walletTitle}{" "}
                <ConnectedIndicator>(connected)</ConnectedIndicator>
              </WalletHeader>
              <WalletWrapper>
                <WalletIcon icon={walletIcon} />
                <Address>{address}</Address>
                <TruncatedAddress>
                  {truncateEthAddress(address)}
                </TruncatedAddress>
              </WalletWrapper>
              <Button
                variant="secondary"
                label="Disconnect"
                width={150}
                height={40}
                onClick={() =>
                  handleDisconnectWallet(
                    connectedWallet,
                    disconnect,
                    setProvider,
                    setSigner
                  )
                }
              />
            </>
          ) : (
            <ConnectButtonWrapper>
              <Button
                variant="primary"
                label="Connect"
                width={150}
                height={40}
                onClick={() => void connect()}
              />
            </ConnectButtonWrapper>
          )}
        </AccountWrapper>
        {(showOtherWallet || showPending) && (
          <SecondaryWrapper>
            {showOtherWallet && (
              <>
                <WalletHeader>{otherWalletTitle}</WalletHeader>
                <WalletWrapper>
                  <LinkedAddressIconWrapper>
                    <LinkedAddressIcon />
                  </LinkedAddressIconWrapper>
                  <Address>{otherWalletAddress}</Address>
                  <TruncatedAddress>
                    {otherWalletAddress &&
                      truncateEthAddress(otherWalletAddress)}
                  </TruncatedAddress>
                </WalletWrapper>
              </>
            )}
            {showPending && (
              <>
                {pendingRequests.map(
                  ({ transactionHash, delegate, delegator }) => (
                    <PendingRequestWrapper key={transactionHash}>
                      <IconWrapper>
                        <PendingRequestIcon />
                      </IconWrapper>
                      <PendingRequestText>
                        <Link href="/wallet-settings">
                          {pendingRequestLinkText}
                        </Link>{" "}
                        to be delegate {toOrFrom} address{" "}
                        <Link
                          href={`https://goerli.etherscan.io/address/${getPendingRequestAddress(
                            delegator,
                            delegate
                          )}`}
                          target="_blank"
                        >
                          {truncateEthAddress(
                            getPendingRequestAddress(delegator, delegate)
                          )}
                        </Link>
                      </PendingRequestText>
                    </PendingRequestWrapper>
                  )
                )}
              </>
            )}
          </SecondaryWrapper>
        )}
      </OuterWrapper>
      <Nav links={_links} />
      <PanelFooter />
    </PanelWrapper>
  );
}

const OuterWrapper = styled.div``;

const PendingRequestWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font: var(--text-sm);
`;

const PendingRequestText = styled.p``;

const Wrapper = styled.div`
  background: var(--grey-100);
  padding-inline: 30px;
  padding-top: 25px;
  padding-bottom: 15px;

  @media ${mobileAndUnder} {
    padding-inline: 20px;
    padding-top: 20px;
  }
`;

const AccountWrapper = styled(Wrapper)`
  min-height: 160px;
`;

const SecondaryWrapper = styled(Wrapper)`
  padding-top: 10px;
  border-top: 1px solid var(--white);
`;

const Title = styled.h1`
  font: var(--header-md);
`;

const WalletHeader = styled.h2`
  font: var(--text-sm);
  font-weight: 700;
  margin-top: 12px;
`;

const ConnectButtonWrapper = styled.div`
  margin-top: 20px;
`;

const WalletWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Address = styled.p`
  font: var(--text-sm);
  margin-top: 10px;
  margin-bottom: 15px;

  @media ${mobileAndUnder} {
    display: none;
  }
`;

const TruncatedAddress = styled(Address)`
  display: none;

  @media ${mobileAndUnder} {
    display: block;
  }
`;

const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const LinkedAddressIconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;

const LinkedAddressIcon = styled(LinkedAddress)`
  circle {
    fill: var(--black);
  }
`;

const ConnectedIndicator = styled.span`
  color: var(--green);
`;

const PendingRequestIcon = styled(Time)`
  margin-top: 2px;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;
