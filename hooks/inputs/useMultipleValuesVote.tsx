import type { DropdownItemT, VoteT } from "types";
import { useEffect, useMemo, useState } from "react";
import {
  encodeMultipleQuery,
  isTooEarly as _isTooEarly,
  isUnresolvable as _isUnresolvable,
  decodeMultipleQuery,
} from "helpers";
import { VoteListItemProps } from "components/VoteList/shared.types";
import { makeMultipleValuesDropdownOptions } from "helpers/voting/getVoteMetaData";
import { useAugmentedVoteData } from "hooks/queries/votes/useAugmentedVoteData";
import { maxInt256 } from "constant/web3/numbers";

export type MultipleInputProps = ReturnType<typeof useMultipleValuesVote>;
type Props = {
  vote: VoteT;
  selectVote: VoteListItemProps["selectVote"];
};

export function useMultipleValuesVote({ vote, selectVote }: Props) {
  const { data: augmentedData } = useAugmentedVoteData({
    time: vote.time,
    identifier: vote.decodedIdentifier,
    ancillaryData: vote.ancillaryDataL2,
    queryOptions: {
      enabled: vote.decodedIdentifier === "MULTIPLE_VALUES",
    },
  });
  const proposedPrice = augmentedData?.proposedPrice;

  const { options, decryptedVote, correctVote } = vote;
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const openInputModal = () => void setInputModalOpen(true);
  const closeInputModal = () => void setInputModalOpen(false);
  const [inputValues, setInputValues] = useState(
    Object.fromEntries(
      options?.map((o) => [o.label, (o.value ?? "").toString()]) ?? []
    )
  );

  const [formattedValue, setFormattedValue] = useState<string | undefined>();
  const [committedVote, setCommittedVote] = useState<string | undefined>();
  const isUnresolvable = _isUnresolvable(formattedValue);
  const isTooEarly = _isTooEarly(formattedValue);

  const isProposedPrice = !!formattedValue && formattedValue === proposedPrice;

  const isValuesEntered = useMemo(() => {
    return (
      !isTooEarly && !isUnresolvable && !!formattedValue && !isProposedPrice
    );
  }, [formattedValue, isTooEarly, isUnresolvable, isProposedPrice]);

  const multipleValuesDropdownActionOptions = makeMultipleValuesDropdownOptions(
    proposedPrice,
    options
  );

  function clearInputValues() {
    setFormattedValue(undefined);
    setInputValues(
      Object.fromEntries(
        options?.map((o) => [o.label, (o.value ?? "").toString()]) ?? []
      )
    );
  }

  // get decrypted vote on load
  useEffect(() => {
    const existingVote = decryptedVote?.price;
    if (existingVote && options?.length) {
      try {
        // decode price, set input values
        setValuesFromPrice(existingVote, options);

        // set actual formatted price
        setCommittedVote(existingVote);
        setFormattedValue(existingVote);
      } catch (e) {
        console.warn("Committed vote invalid. Vote: ", existingVote);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decryptedVote?.price, options]);

  function setValuesFromPrice(price: string, options: DropdownItemT[]) {
    if (options?.length) {
      const values = decodeMultipleQuery(price, options.length);
      // set input values for display purposes
      setInputValues(
        Object.fromEntries(
          options?.map((o, i) => [o.label, values[i].toString()])
        )
      );
    }
  }

  function setProposedPrice() {
    if (proposedPrice && options) {
      setValuesFromPrice(proposedPrice, options);
      openInputModal();
    }
  }

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
    if (item.action === "OPEN_MULTIPLE_VALUES_MODAL") {
      if (_isTooEarly(formattedValue) || _isUnresolvable(formattedValue)) {
        clearInputValues();
      }

      openInputModal();
    } else if (item.action === "SET_PROPOSED_PRICE") {
      // if request was proposed as "Unresolvable" we want to display "Unresolvable" in the dropdown
      if (_isUnresolvable(proposedPrice)) {
        setFormattedValue(String(item.value));
      } else {
        setProposedPrice();
      }
    } else if (
      _isTooEarly(String(item.value)) ||
      _isUnresolvable(String(item.value))
    ) {
      setFormattedValue(String(item.value));
    }
  }

  function getCommittedVoteDropdownValue() {
    if (_isUnresolvable(committedVote)) {
      return {
        label: "Unresolvable",
        value: maxInt256.toString(),
      };
    }
    return (
      multipleValuesDropdownActionOptions?.find((option) => {
        return option.value === committedVote;
      }) ?? {
        label: "Custom values",
        value: "OPEN_MULTIPLE_VALUES_MODAL",
      }
    );
  }

  // remove "Proposed values" options if unable to find this value from the oracle
  const dropdownOptions = (() => {
    return multipleValuesDropdownActionOptions.filter((o) => {
      if (!proposedPrice) {
        return o.label !== "Proposed values";
      }
      return true;
    });
  })();

  function getVoteForDisplay() {
    return getCommittedVoteDropdownValue()?.label;
  }

  function getCorrectVote() {
    return (
      multipleValuesDropdownActionOptions?.find((option) => {
        return option.value === correctVote;
      })?.label ?? "Custom values"
    );
  }

  const selectedDropdownOption = (() => {
    if (committedVote) {
      return getCommittedVoteDropdownValue();
    }

    if (isValuesEntered) {
      return {
        label: "Custom values",
        value: "OPEN_MULTIPLE_VALUES_MODAL",
      };
    }

    return multipleValuesDropdownActionOptions?.find((option) => {
      return option.value === formattedValue;
    });
  })();

  const canSubmitMultipleValues =
    Boolean(inputModalOpen) &&
    Object.values(inputValues).every(Boolean) &&
    !inputError;

  return {
    getCorrectVote,
    dropdownOptions,
    proposedPrice,
    isProposedPrice,
    setProposedPrice,
    getVoteForDisplay,
    committedVote,
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
