import type { DropdownItemT, VoteT } from "types";
import { useEffect, useMemo, useState } from "react";
import {
  encodeMultipleQuery,
  isTooEarly as _isTooEarly,
  isUnresolvable as _isUnresolvable,
  decodeMultipleQuery,
} from "helpers";
import { VoteListItemProps } from "components/VoteList/shared.types";
import { multipleValuesDropdownOptions } from "helpers/voting/getVoteMetaData";

export type MultipleInputProps = ReturnType<typeof useMultipleValuesVote>;
type Props = {
  vote: VoteT;
  selectVote: VoteListItemProps["selectVote"];
};

export function useMultipleValuesVote({ vote, selectVote }: Props) {
  const { options, decryptedVote } = vote;
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const openInputModal = () => void setInputModalOpen(true);
  const closeInputModal = () => void setInputModalOpen(false);
  const [inputValues, setInputValues] = useState(
    Object.fromEntries(
      options?.map((o) => [o.label, (o.value ?? "").toString()]) ?? []
    )
  );
  const [formattedValue, setFormattedValue] = useState<string | undefined>();

  const isUnresolvable = _isUnresolvable(formattedValue);
  const isTooEarly = _isTooEarly(formattedValue);

  const isValuesEntered = useMemo(() => {
    return !isTooEarly && !isUnresolvable && !!formattedValue;
  }, [formattedValue, isTooEarly, isUnresolvable]);

  // get decrypted vote on load
  useEffect(() => {
    const existingVote = decryptedVote?.price;
    if (existingVote && options?.length) {
      try {
        const values = decodeMultipleQuery(existingVote, options.length);
        // set input values for display purposes
        setInputValues(
          Object.fromEntries(
            options?.map((o, i) => [o.label, values[i].toString()])
          )
        );
        // set actual formatted price
        setFormattedValue(decryptedVote?.price);
      } catch (e) {
        console.warn("Committed vote invalid. Vote: ", existingVote);
      }
    }
  }, [decryptedVote?.price, options]);

  function onInputChange(item: DropdownItemT) {
    setInputValues((current) => {
      return {
        ...current,
        [item.label]: String(item.value),
      };
    });
  }

  const inputError = useMemo(() => {
    try {
      void encodeMultipleQuery(Object.values(inputValues));
      return "";
    } catch (err) {
      if (err instanceof Error) {
        return err.message;
      }
    }
  }, [inputValues]);

  function onSubmitMultipleValues() {
    try {
      const formatted = encodeMultipleQuery(Object.values(inputValues));
      setFormattedValue(formatted);
      closeInputModal();
    } catch (e) {
      return;
    }
  }

  // set value upstream if a valid answer has been entered
  useEffect(() => {
    if (formattedValue && selectVote) {
      selectVote?.(formattedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedValue]);

  function onDropdownChange(item: DropdownItemT) {
    if (item.value === "OPEN_MULTIPLE_VALUES_MODAL") {
      setInputModalOpen(true);
    } else if (
      _isTooEarly(String(item.value)) ||
      _isUnresolvable(String(item.value))
    ) {
      setFormattedValue(String(item.value));
    }
  }

  const selectedDropdownOption = (() => {
    if (isValuesEntered) {
      return {
        label: "Entered values",
        value: "OPEN_MULTIPLE_VALUES_MODAL",
      };
    }

    return multipleValuesDropdownOptions?.find((option) => {
      return option.value === formattedValue;
    });
  })();

  const canSubmitMultipleValues =
    Boolean(inputModalOpen) &&
    Object.values(inputValues).every(Boolean) &&
    !inputError;

  return {
    onSubmitMultipleValues,
    isValuesEntered,
    selectedDropdownOption,
    onInputChange,
    inputModalOpen,
    openInputModal,
    closeInputModal,
    isUnresolvable,
    isTooEarly,
    inputValues,
    value: inputValues,
    formattedValue,
    inputError,
    items: options,
    onDropdownChange,
    canSubmitMultipleValues,
  };
}
