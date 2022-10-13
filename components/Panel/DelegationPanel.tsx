import { Button, PanelErrorBanner, TextInput } from "components";
import { getAddress, isAddress } from "helpers";
import { useErrorContext, useUserContext } from "hooks";
import One from "public/assets/icons/one.svg";
import Three from "public/assets/icons/three.svg";
import Two from "public/assets/icons/two.svg";
import { useState } from "react";
import styled from "styled-components";
import { PanelFooter } from "./PanelFooter";
import { PanelTitle } from "./PanelTitle";
import { PanelSectionText, PanelSectionTitle, PanelWrapper } from "./styles";

export function DelegationPanel() {
  const { address } = useUserContext();
  const { addErrorMessage, clearErrorMessages } = useErrorContext("delegation");
  const [delegateAddressToAdd, setDelegateAddressToAdd] = useState("");

  function onInput(inputAddress: string) {
    setDelegateAddressToAdd(inputAddress);

    if (shouldRunValidation(inputAddress)) {
      if (!isAddress(inputAddress)) {
        addErrorMessage("Please enter a valid Ethereum address.");
        return;
      }
      if (getAddress(inputAddress) === getAddress(address)) {
        addErrorMessage("You cannot delegate to yourself.");
        return;
      }
    } else {
      clearErrorMessages();
    }
  }

  function shouldRunValidation(address: string) {
    if (address.startsWith("0x") && address.length >= 40) return true;
    if (address.length >= 42) return true;
    return false;
  }

  return (
    <PanelWrapper>
      <PanelTitle title="Add delegate wallet" />
      <InnerWrapper>
        <PanelSectionTitle>Delegation</PanelSectionTitle>
        <PanelSectionText>Explanation of voting delegation</PanelSectionText>
        <StepsWrapper>
          <StepWrapper>
            <OneIcon />
            Add secondary wallet address text text
          </StepWrapper>
          <StepWrapper>
            <TwoIcon />
            Request has to be accepted in secondary wallet text text
          </StepWrapper>
          <StepWrapper>
            <ThreeIcon />
            You now have a secondary delegation wallet where you can vote text text
          </StepWrapper>
        </StepsWrapper>
        <WalletInputWrapper>
          <TextInput value={delegateAddressToAdd} onInput={onInput} placeholder="Enter delegate address" />
          <Button variant="primary" label="Add delegate wallet" onClick={() => {}} height={45} width="100%" />
        </WalletInputWrapper>
        <PanelErrorBanner errorType="delegation" />
      </InnerWrapper>
      <PanelFooter />
    </PanelWrapper>
  );
}

const WalletInputWrapper = styled.div`
  margin-top: 30px;
  display: grid;
  gap: 20px;
`;

const InnerWrapper = styled.div`
  padding-inline: 30px;
  padding-block: 20px;
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

const OneIcon = styled(One)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;

const TwoIcon = styled(Two)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;

const ThreeIcon = styled(Three)`
  circle {
    fill: var(--black);
  }
  path {
    fill: var(--white);
  }
`;
