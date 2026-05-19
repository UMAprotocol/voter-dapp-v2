import { useErrorContext } from "hooks";
import { ChangeEvent } from "react";
import { normalizeDecimalInput } from "./normalizeDecimalInput";

export function useHandleDecimalInput(
  onInput: (value: string) => void,
  maxDecimals: number,
  allowNegative: boolean,
  type = "number"
) {
  const { addErrorMessage, removeErrorMessage } = useErrorContext();

  return (event: ChangeEvent<HTMLInputElement>) => {
    const result = normalizeDecimalInput(
      event.target.value,
      maxDecimals,
      allowNegative,
      type
    );
    const decimalsErrorMessage = `Cannot have more than ${maxDecimals} decimals.`;

    if (result.kind === "reject") return;
    if (result.kind === "tooManyDecimals") {
      addErrorMessage(decimalsErrorMessage);
      return;
    }

    removeErrorMessage(decimalsErrorMessage);
    onInput(result.value);
  };
}
