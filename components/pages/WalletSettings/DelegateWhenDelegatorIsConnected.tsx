import { Button } from "components/Button";
import NextLink from "next/link";
import Link from "public/assets/icons/link.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, BarWrapper, WalletWrapper } from "./styles";

interface Props {
  address: string | undefined;
  status: "not-requested" | "awaiting-approval" | "accepted";
  delegateRequestTransaction: string | undefined;
  addDelegate: () => void;
  cancelDelegateRequest: () => void;
  removeDelegate: () => void;
}
export function DelegateWhenDelegatorIsConnected({
  address,
  status,
  delegateRequestTransaction,
  addDelegate,
  cancelDelegateRequest,
  removeDelegate,
}: Props) {
  return (
    <>
      {status === "not-requested" && <NotRequested addDelegate={addDelegate} />}
      {status === "awaiting-approval" && (
        <AwaitingApproval
          address={address}
          delegateRequestTransaction={delegateRequestTransaction}
          cancelDelegateRequest={cancelDelegateRequest}
        />
      )}
      {status === "accepted" && <Accepted address={address} removeDelegate={removeDelegate} />}
    </>
  );
}

function NotRequested({ addDelegate }: { addDelegate: () => void }) {
  return (
    <NotRequestedWrapper>
      <Text>No delegate wallet set</Text>
      <AddWalletButtonWrapper>
        <Button variant="primary" label={"Add wallet"} onClick={addDelegate} width={160} height={40} />
      </AddWalletButtonWrapper>
    </NotRequestedWrapper>
  );
}

function AwaitingApproval({
  address,
  delegateRequestTransaction,
  cancelDelegateRequest,
}: {
  address: string | undefined;
  delegateRequestTransaction: string | undefined;
  cancelDelegateRequest: () => void;
}) {
  return (
    <AwaitingApprovalWrapper>
      <AddressWrapper>
        <AwaitingApprovalIcon />
        <div>
          <Text>Delegate wallet request sent to {address}</Text>
          <Text>
            Waiting for approval |{" "}
            <NextLink href={`https://goerli.etherscan.io/${delegateRequestTransaction}`} passHref>
              <A target="_blank">View Transaction</A>
            </NextLink>
          </Text>
        </div>
      </AddressWrapper>
      <CancelRequestButtonWrapper>
        <Button variant="secondary" label="Cancel request" onClick={cancelDelegateRequest} width={160} height={40} />
      </CancelRequestButtonWrapper>
    </AwaitingApprovalWrapper>
  );
}

const AddressWrapper = styled.div`
  display: flex;
  gap: 15px;
`;

const AwaitingApprovalWrapper = styled(BarWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

function Accepted({ address, removeDelegate }: { address: string | undefined; removeDelegate: () => void }) {
  return (
    <AcceptedWrapper>
      <WalletWrapper>
        <LinkedAddressIconWrapper>
          <LinkedAddressIcon />
        </LinkedAddressIconWrapper>
        <Address>{address}</Address>
      </WalletWrapper>
      <AllowedAction>Voting</AllowedAction>
      <AllowedAction>Claim and restake</AllowedAction>
      <RemoveDelegateButtonWrapper>
        <Button variant="secondary" label="Remove wallet" onClick={removeDelegate} width={160} height={40} />
      </RemoveDelegateButtonWrapper>
    </AcceptedWrapper>
  );
}

const Text = styled.p`
  font: var(--text-sm);
`;

const RemoveDelegateButtonWrapper = styled.div``;

const AcceptedWrapper = styled(BarWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NotRequestedWrapper = styled(AcceptedWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CancelRequestButtonWrapper = styled.div``;

const AddWalletButtonWrapper = styled.div``;

const AwaitingApprovalIcon = styled(Time)`
  margin-top: 2px;
`;

const ConnectedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;

const A = styled.a`
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

const LinkedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
