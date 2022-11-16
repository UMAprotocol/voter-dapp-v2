import { maximumApprovalAmountString } from "constant/misc/maximumApprovalAmountString";
import { useErrorContext } from "hooks";
import { ChangeEvent } from "react";

export function useHandleDecimalInput(
  onInput: (value: string) => void,
  maxDecimals: number,
  allowNegative: boolean,
  type = "number"
) {
  const { addErrorMessage, removeErrorMessage } = useErrorContext();

  return (event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (type !== "number") {
      onInput(value);
      return;
    }

    if (value.includes(maximumApprovalAmountString)) {
      value = value.replace(maximumApprovalAmountString, "");
    }

    const decimalsErrorMessage = `Cannot have more than ${maxDecimals} decimals.`;
    const negativeAllowedDecimalRegex = /^-?\d*\.?\d{0,}$/;
    const onlyPositiveDecimalsRegex = /^\d*\.?\d{0,}$/;
    const decimalsRegex = allowNegative
      ? negativeAllowedDecimalRegex
      : onlyPositiveDecimalsRegex;
    const isValidDecimalNumber = decimalsRegex.test(value);

    if (!isValidDecimalNumber) return;

    const hasDecimals = value.includes(".");

    if (hasDecimals) {
      const decimals = value.split(".")[1];
      const hasTooManyDecimals = decimals.length > maxDecimals;
      if (hasTooManyDecimals) {
        addErrorMessage(decimalsErrorMessage);
        return;
      }
    }

    removeErrorMessage(decimalsErrorMessage);
    onInput(value);
  };
}
