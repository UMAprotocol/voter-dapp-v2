import { Button } from "components";
import UmaToken from "public/assets/icons/uma-token.svg";
import styled from "styled-components";
import { useHandleDecimalInput } from "hooks";
import { Input, Wrapper } from "./Input";

interface Props {
  value: string;
  onInput: (value: string) => void;
  onMax: () => void;
  disabled?: boolean;
  placeholder?: string;
  allowNegative?: boolean;
  maxDecimals?: number;
}
export function AmountInput({
  value,
  onInput,
  onMax,
  disabled,
  placeholder,
  allowNegative = true,
  maxDecimals = 18,
}: Props) {
  const onChange = useHandleDecimalInput(onInput, maxDecimals, allowNegative);

  return (
    <_Wrapper aria-disabled={disabled}>
      <_Input
        value={value}
        onChange={onChange}
        disabled={disabled}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        placeholder={placeholder ?? "Enter amount"}
        minLength={1}
        maxLength={79}
        spellCheck="false"
      />
      <UmaTokenIcon />
      <MaxButtonWrapper>
        <Button
          label="Max"
          variant="secondary"
          width={50}
          height={25}
          fontSize={12}
          onClick={onMax}
          disabled={disabled}
        />
      </MaxButtonWrapper>
    </_Wrapper>
  );
}

const _Wrapper = styled(Wrapper)`
  position: relative;

  &[aria-disabled="true"] {
    /* don't set opacity on the max button wrapper div, otherwise the opacity will be applied twice */
    > :not(div) {
      opacity: 0.25;
    }
  }
`;

const _Input = styled(Input)`
  padding-left: 55px;

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
