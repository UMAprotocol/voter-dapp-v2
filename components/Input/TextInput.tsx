import styled from "styled-components";
import { ChangeEvent } from "react";
import { Wrapper, Input } from "./Input";

interface Props {
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: "text" | "email";
}
export function TextInput({ value, onChange, disabled, placeholder, type = "text" }: Props) {
  return (
    <_Wrapper aria-disabled={disabled}>
      <_Input
        value={value ?? undefined}
        onChange={onChange}
        disabled={disabled}
        type={type}
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
