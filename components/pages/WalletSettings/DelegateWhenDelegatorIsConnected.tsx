import Link from "public/assets/icons/link.svg";
import Time from "public/assets/icons/time.svg";
import styled from "styled-components";
import { BarWrapper } from "./styles";

interface Props {
  address: string | undefined;
  awaitingApproval: boolean;
  delegateRequestAccepted: boolean;
  delegateRequestTransaction: string | undefined;
  addDelegate: () => void;
  cancelDelegateRequest: () => void;
  removeDelegate: () => void;
}
export function DelegateWhenDelegatorIsConnected({
  address,
  awaitingApproval,
  delegateRequestAccepted,
  delegateRequestTransaction,
  addDelegate,
  cancelDelegateRequest,
  removeDelegate,
}: Props) {
  function getStatus() {
    if (awaitingApproval) return "awaiting-approval";
    if (delegateRequestAccepted) return "accepted";
    return "not-requested";
  }
  const status = getStatus();

  return (
    <Wrapper>
      {status === "not-requested" && <NotRequested addDelegate={addDelegate} />}
      {status === "awaiting-approval" && (
        <AwaitingApproval
          address={address}
          delegateRequestTransaction={delegateRequestTransaction}
          cancelDelegateRequest={cancelDelegateRequest}
        />
      )}
      {status === "accepted" && <Accepted address={address} removeDelegate={removeDelegate} />}
    </Wrapper>
  );
}

function NotRequested({ addDelegate }: { addDelegate: () => void }) {
  return <>not requested</>;
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
  return <>awaiting approval</>;
}

function Accepted({ address, removeDelegate }: { address: string | undefined; removeDelegate: () => void }) {
  return <>accepted</>;
}

const Wrapper = styled(BarWrapper)``;

const AddWalletButtonWrapper = styled.div``;

const AwaitingApprovalIcon = styled(Time)``;

const ConnectedAddressIcon = styled(Link)`
  circle {
    fill: var(--black);
  }
`;
