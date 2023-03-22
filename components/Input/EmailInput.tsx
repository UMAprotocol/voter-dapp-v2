import { useErrorContext } from "hooks";
import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { ErrorOriginT } from "types";
import { useDebounce } from "usehooks-ts";
import { Input, Wrapper } from "./Input";

interface Props {
  value: string;
  onInput: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  errorOrigin?: ErrorOriginT;
}
export function EmailInput({
  value,
  onInput,
  disabled,
  placeholder = "Enter your email",
  errorOrigin = "remind",
}: Props) {
  const { addErrorMessage, removeErrorMessage } = useErrorContext(errorOrigin);
  // see https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html#input.email.attrs.value.single
  const isEmailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const errorMessage = "Please enter a valid email address";
  const [isEmail, setIsEmail] = useState(true);
  const debouncedIsEmail = useDebounce(isEmail, 1000);

  useEffect(() => {
    const isEmail = value === "" || isEmailRegex.test(value);

    setIsEmail(isEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (debouncedIsEmail) {
      removeErrorMessage(errorMessage);
    } else {
      addErrorMessage(errorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedIsEmail]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    onInput(value);
  }

  return (
    <_Wrapper aria-disabled={disabled}>
      <_Input
        value={value}
        onChange={onChange}
        inputMode="email"
        disabled={disabled}
        type="email"
        autoComplete="off"
        autoCorrect="off"
        placeholder={placeholder}
        minLength={1}
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
