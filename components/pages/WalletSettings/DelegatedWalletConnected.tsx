import { Button } from "components/Button";
import { WalletIcon } from "components/Wallet/WalletIcon";
import Time from "public/assets/icons/time.svg";
import styled from "styled-components";
import { AllowedAction } from "./AllowedAction";
import { Address, BarWrapper } from "./styles";

interface Props {
  address: string | undefined;
  awaitingApproval: boolean;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  walletIcon?: string | undefined;
  approveDelegateRequest: () => void;
  removeDelegate: () => void;
  ignoreDelegateRequest: () => void;
}
export function DelegateWhenDelegateIsConnected({
  address,
  awaitingApproval,
  delegateRequestAccepted,
  delegateRequestTransaction,
  walletIcon,
  approveDelegateRequest,
  removeDelegate,
  ignoreDelegateRequest,
}: Props) {
  function getStatus() {
    if (awaitingApproval) return "awaiting-approval";
    if (delegateRequestAccepted) return "accepted";
    return "ignored";
  }
  const status = getStatus();

  return (
    <Wrapper>
      {status === "accepted" && <Accepted address={address} walletIcon={walletIcon} removeDelegate={removeDelegate} />}
      {status === "awaiting-approval" && (
        <AwaitingApproval
          address={address}
          delegateRequestTransaction={delegateRequestTransaction}
          approveDelegateRequest={approveDelegateRequest}
          ignoreDelegateRequest={ignoreDelegateRequest}
        />
      )}
      {status === "ignored" && <Ignored />}
    </Wrapper>
  );
}

function Accepted({
  walletIcon,
  address,
  removeDelegate,
}: {
  address: string | undefined;
  walletIcon: string | undefined;
  removeDelegate: () => void;
}) {
  return (
    <>
      <AcceptedAddressWrapper>
        <WalletIcon icon={walletIcon} />
        <Address>{address}</Address>
      </AcceptedAddressWrapper>
      <AllowedAction>Voting</AllowedAction>
      <AllowedAction>Claim &amp; Stake</AllowedAction>
      <RemoveDelegateButtonWrapper>
        <Button variant="secondary" label="Remove connection" width={160} height={40} onClick={removeDelegate} />
      </RemoveDelegateButtonWrapper>
    </>
  );
}

const AcceptedAddressWrapper = styled.div``;

const RemoveDelegateButtonWrapper = styled.div``;

function AwaitingApproval({
  address,
  delegateRequestTransaction,
  approveDelegateRequest,
  ignoreDelegateRequest,
}: {
  address: string | undefined;
  delegateRequestTransaction: string | undefined;
  approveDelegateRequest: () => void;
  ignoreDelegateRequest: () => void;
}) {
  return (
    <>
      <AwaitingApprovalAddressWrapper>
        <AwaitingApprovalIcon />
        <Address>{address}</Address>
        Waiting for approval
      </AwaitingApprovalAddressWrapper>
      <ApproveDelegateRequestButtonWrapper>
        <Button variant="primary" label="Approve" width={160} height={40} onClick={approveDelegateRequest} />
      </ApproveDelegateRequestButtonWrapper>
      <IgnoreDelegateRequestButtonWrapper>
        <Button variant="secondary" label="Ignore" width={160} height={40} onClick={ignoreDelegateRequest} />
      </IgnoreDelegateRequestButtonWrapper>
    </>
  );
}

const AwaitingApprovalAddressWrapper = styled.div``;

const ApproveDelegateRequestButtonWrapper = styled.div``;

const IgnoreDelegateRequestButtonWrapper = styled.div``;

const AwaitingApprovalIcon = styled(Time)``;

function Ignored() {
  return <div>Ignored</div>;
}

const Wrapper = styled(BarWrapper)``;
