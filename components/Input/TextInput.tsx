import { useHandleDecimalInput } from "hooks";
import styled from "styled-components";
import { Input, Wrapper } from "./Input";
import Close from "public/assets/icons/x.svg";

interface Props {
  value: string;
  onInput: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  placeholder?: string;
  type?: "text" | "number";
  isNumeric?: boolean;
  maxDecimals?: number;
  allowNegative?: boolean;
  maxLength?: number;
}
export function TextInput({
  value,
  onInput,
  onClear,
  disabled,
  placeholder,
  type = "text",
  maxDecimals = 18,
  allowNegative = true,
  maxLength = 79,
}: Props) {
  const inputMode = type === "text" ? "text" : "decimal";
  // treat all as text inputs to avoid unwanted automatic number formatting
  const _type = "text";
  const onChange = useHandleDecimalInput(
    onInput,
    maxDecimals,
    allowNegative,
    _type
  );

  return (
    <_Wrapper aria-disabled={disabled}>
      <_Input
        value={value ?? undefined}
        onChange={onChange}
        inputMode={inputMode}
        disabled={disabled}
        type={_type}
        autoComplete="off"
        autoCorrect="off"
        placeholder={placeholder ?? "Enter value"}
        minLength={1}
        maxLength={maxLength}
        spellCheck="false"
      />
      {!!onClear && (
        <ClearInputButton aria-label="exit custom input" onClick={onClear}>
          <CloseIcon />
        </ClearInputButton>
      )}
    </_Wrapper>
  );
}

const _Wrapper = styled(Wrapper)`
  position: relative;
  &[aria-disabled="true"] {
    opacity: 0.25;
  }
`;

const _Input = styled(Input)`
  padding-left: 15px;
`;

const ClearInputButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--grey-100);
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.75;
  }
`;

const CloseIcon = styled(Close)``;
