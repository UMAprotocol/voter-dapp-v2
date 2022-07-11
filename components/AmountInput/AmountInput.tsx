import styled from "styled-components";
import UmaToken from "public/assets/icons/uma-token.svg";
import { Button } from "components/Button";
import { ChangeEvent } from "react";

interface Props {
  value: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMax: () => void;
}
export function AmountInput({ value, onChange, onMax }: Props) {
  return (
    <Wrapper>
      <Input
        value={value}
        onChange={onChange}
        type="number"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        placeholder="Enter amount"
        minLength={1}
        maxLength={79}
        spellCheck="false"
      />
      <UmaTokenIcon />
      <MaxButtonWrapper>
        <Button label="Max" variant="secondary" width={50} height={25} fontSize={12} onClick={onMax} />
      </MaxButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  font: var(--text-md);
  position: relative;
  max-width: 510px;
`;

const Input = styled.input`
  width: 100%;
  height: 45px;
  border: 1px solid var(--black);
  border-radius: 5px;
  color: var(--black-opacity-50);
  padding-left: 55px;

  ::placeholder {
    color: var(--black-opacity-50);
  }

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const UmaTokenIcon = styled(UmaToken)`
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  margin: auto 0;
`;

const MaxButtonWrapper = styled.div`
  height: fit-content;
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  margin: auto 0;
`;
