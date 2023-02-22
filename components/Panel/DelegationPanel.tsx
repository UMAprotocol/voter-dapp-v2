import {
  Button,
  LoadingSpinner,
  PanelErrorBanner,
  TextInput,
} from "components";
import { mobileAndUnder } from "constant";
import { getAddress, isAddress, truncateEthAddress } from "helpers";
import {
  useDelegationContext,
  useErrorContext,
  usePanelContext,
  useUserContext,
} from "hooks";
import NextLink from "next/link";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Time from "public/assets/icons/time-with-inner-circle.svg";
import Two from "public/assets/icons/two.svg";
import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";
import { config } from "helpers/config";

export function DelegationPanel() {
  const { closePanel } = usePanelContext();
  const { address } = useUserContext();
  const { addErrorMessage, clearErrorMessages } = useErrorContext("delegation");
  const [delegateAddressToAdd, setDelegateAddressToAdd] = useState("");
  const {
    getDelegationStatus,
    sendRequestToBeDelegate,
    getPendingSentRequestsToBeDelegate,
    getDelegationDataFetching,
  } = useDelegationContext();

  const delegationStatus = getDelegationStatus();

  useEffect(() => {
    // only show this panel when the user has not yet entered a delegation relationship, or the user has requested another wallet to be their delegate wallet
    if (
      !(
        delegationStatus === "no-delegation" ||
        delegationStatus === "delegator-pending"
      )
    ) {
      closePanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegationStatus]);

  const pendingRequests = getPendingSentRequestsToBeDelegate();

  // only allow user to add a delegate wallet if they are neither a delegator nor a delegate
  const showAddDelegateInput = delegationStatus === "no-delegation";

  const showPendingRequests =
    delegationStatus === "delegator-pending" && pendingRequests.length > 0;

  function onAddDelegateWallet() {
    if (!address) return;
    if (!validateInputAddress(delegateAddressToAdd)) return;

    sendRequestToBeDelegate(delegateAddressToAdd);
  }

  function onInput(inputAddress: string) {
    setDelegateAddressToAdd(inputAddress);

    if (shouldRunValidation(inputAddress)) {
      if (!validateInputAddress(inputAddress)) return;
    } else {
      clearErrorMessages();
    }
  }

  function validateInputAddress(inputAddress: string) {
    if (!isAddress(inputAddress)) {
      addErrorMessage("Please enter a valid Ethereum address.");
      return false;
    }
    if (getAddress(inputAddress) === getAddress(address)) {
      addErrorMessage("You cannot delegate to yourself.");
      return false;
    }
    return true;
  }

  function shouldRunValidation(address: string) {
    if (address.startsWith("0x") && address.length >= 40) return true;
    if (address.length >= 42) return true;
    return false;
  }

  function isLoading() {
    return getDelegationDataFetching();
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Add delegate wallet" />
      <InnerWrapper>
        <PanelSectionTitle>Delegation</PanelSectionTitle>
        <PanelSectionText>
          For more information about vote delegation, please refer here. TO DO:
          Add docs link.
        </PanelSectionText>
        <StepsWrapper>
          <StepWrapper>
            <IconWrapper>
              <OneIcon />
            </IconWrapper>
            Request an address to be your delegate.
          </StepWrapper>
          <StepWrapper>
            <IconWrapper>
              <TwoIcon />
            </IconWrapper>
            The selected delegate must accept the delegation request.
          </StepWrapper>
          <StepWrapper>
            <IconWrapper>
              <ThreeIcon />
            </IconWrapper>
            After acceptance, the delegate can vote on your behalf.
          </StepWrapper>
        </StepsWrapper>
        {isLoading() ? (
          <LoadingSpinnerWrapper>
            <LoadingSpinner />
          </LoadingSpinnerWrapper>
        ) : (
          <>
            {showAddDelegateInput && (
              <AddDelegateInputWrapper>
                <TextInput
                  value={delegateAddressToAdd}
                  onInput={onInput}
                  placeholder="Enter delegate address"
                />
                <Button
                  variant="primary"
                  label="Add delegate wallet"
                  onClick={onAddDelegateWallet}
                  height={45}
                  width="100%"
                />
              </AddDelegateInputWrapper>
            )}
            {showPendingRequests &&
              pendingRequests.map(({ delegate, transactionHash }) => (
                <PendingRequestWrapper key={transactionHash}>
                  <AddressWrapper>
                    <IconWrapper>
                      <PendingRequestIcon />
                    </IconWrapper>
                    <PendingRequestDetailsWrapper>
                      <PendingRequestText>
                        Request sent to {truncateEthAddress(delegate)}
                      </PendingRequestText>
                      <PendingRequestText>
                        Waiting for approval
                      </PendingRequestText>
                      <PendingRequestText>
                        <Link
                          href={config.makeTransactionHashLink(transactionHash)}
                          target="_blank"
                        >
                          View Transaction
                        </Link>
                      </PendingRequestText>
                    </PendingRequestDetailsWrapper>
                  </AddressWrapper>
                </PendingRequestWrapper>
              ))}
          </>
        )}
        <PanelErrorBanner errorOrigin="delegation" />
      </InnerWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const LoadingSpinnerWrapper = styled.div`
  height: 300px;
  display: grid;
  place-items: center;
`;

const PendingRequestDetailsWrapper = styled.div``;

const PendingRequestText = styled(PanelSectionText)`
  margin: 0;
  > :last-child {
    margin-top: 5px;
  }
`;

const AddDelegateInputWrapper = styled.div`
  margin-top: 30px;
  display: grid;
  gap: 20px;
`;

const PendingRequestWrapper = styled.div`
  margin-top: 30px;
  padding-block: 10px;
  padding-inline: 12px;
  background: var(--grey-100);
  border-radius: 2px;
`;

const PendingRequestIcon = styled(Time)`
  margin-top: 2px;
`;

const InnerWrapper = styled.div`
  padding-inline: 30px;
  padding-block: 20px;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const StepsWrapper = styled.ul`
  > :not(:last-child) {
    margin-bottom: 10px;
  }
`;

const StepWrapper = styled.li`
  display: flex;
  align-items: center;
  gap: 15px;
  font: var(--text-sm);
`;

const numberIconStyle = css`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;

const OneIcon = styled(One)`
  ${numberIconStyle}
`;

const TwoIcon = styled(Two)`
  ${numberIconStyle}
`;

const ThreeIcon = styled(Three)`
  ${numberIconStyle}
`;

export const AddressWrapper = styled.div`
  display: flex;
  align-items: top;
  gap: 15px;
`;

const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
`;
