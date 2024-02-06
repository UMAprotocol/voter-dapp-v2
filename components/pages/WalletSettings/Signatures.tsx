import { useState } from "react";
import { mobileAndUnder, tabletAndUnder } from "constant";
import styled from "styled-components";
import { BarButtonPrimary, BarButtonSecondary, Header } from "./styles";
import { saveSigningKeys } from "helpers";
import { useAccountDetails, useWalletContext } from "hooks";
import { TextInput } from "components";

export function useSignatures() {
  const { address } = useAccountDetails();
  const { sign, signingKeys } = useWalletContext();
  const signingKey = address ? signingKeys[address] : undefined;
  const [privateKey, setPrivateKey] = useState(signingKey?.privateKey);
  function update(value: string) {
    setPrivateKey(value);
  }
  function save() {
    address &&
      privateKey &&
      signingKeys &&
      signingKey &&
      saveSigningKeys({
        ...signingKeys,
        [address]: {
          ...signingKey,
          privateKey,
        },
      });
  }
  function reset() {
    signingKey?.privateKey && setPrivateKey(signingKey.privateKey);
  }
  function resign() {
    sign();
  }
  const canSave =
    address &&
    privateKey &&
    signingKeys &&
    signingKey &&
    signingKey?.privateKey != privateKey;
  const canReset =
    signingKey?.privateKey && signingKey?.privateKey != privateKey;
  const hasSignature = !!signingKey?.privateKey;

  return {
    privateKey,
    save,
    reset,
    update,
    canSave,
    canReset,
    resign,
    hasSignature,
  };
}

export function Signatures() {
  const {
    privateKey,
    update,
    save,
    reset,
    hasSignature,
    canSave,
    canReset,
    resign,
  } = useSignatures();

  return (
    <>
      <Header>Signature</Header>
      <BarWrapper>
        Voting Signature:
        {hasSignature ? (
          <TextInput value={privateKey ?? ""} onInput={update} />
        ) : (
          "No Signature found, try signing first"
        )}
        {canSave && (
          <ButtonWrapper>
            <BarButtonSecondary label={`Save`} onClick={() => save()} />
          </ButtonWrapper>
        )}
        {canReset && (
          <ButtonWrapper>
            <BarButtonPrimary label={`Reset`} onClick={() => reset()} />
          </ButtonWrapper>
        )}
        <ButtonWrapper>
          <BarButtonPrimary label={`Sign`} onClick={() => resign()} />
        </ButtonWrapper>
      </BarWrapper>
    </>
  );
}

const ButtonWrapper = styled.div`
  width: fit-content;
`;
export const BarWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  align-items: center;
  height: 80px;
  padding-inline: 25px;
  margin-top: 20px;
  margin-bottom: 40px;
  background: var(--white);
  border-radius: 5px;

  @media ${tabletAndUnder} {
    grid-auto-columns: auto;
  }

  @media ${mobileAndUnder} {
    height: auto;
    grid-auto-columns: unset;
    grid-auto-flow: row;
    grid-auto-rows: auto;
    gap: 10px;
    padding: 15px;

    > :last-child {
      justify-self: unset;
    }
  }
`;
