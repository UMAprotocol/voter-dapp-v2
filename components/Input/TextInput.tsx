import { useHandleDecimalInput } from "hooks";
import styled from "styled-components";
import { Input, Wrapper } from "./Input";

interface Props {
  value: string;
  onInput: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: "text" | "number" | "email";
  isNumeric?: boolean;
  maxDecimals?: number;
  allowNegative?: boolean;
}
export function TextInput({
  value,
  onInput,
  disabled,
  placeholder,
  type = "text",
  maxDecimals = 18,
  allowNegative = true,
}: Props) {
  const inputMode =
    type === "text" ? "text" : type === "number" ? "decimal" : "email";
  // treat numbers as text inputs
  const _type = type === "number" ? "text" : type;
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
        maxLength={79}
        spellCheck="false"
      />
    </_Wrapper>
  );
}

const _Wrapper = styled(Wrapper)`
  &[aria-disabled="true"] {
    opacity: 0.25;
  }
`;

const _Input = styled(Input)`
  padding-left: 15px;
`;
