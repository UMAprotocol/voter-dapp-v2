import { MultipleInputProps } from "hooks/inputs/useMultipleValuesVote";
import { Modal } from "./Modal";
import { cn } from "lib/utils";
import { TextInput } from "components/Input/TextInput";
import { Button } from "components/Button";
import PencilIcon from "public/assets/icons/pencil.svg";
import Warning from "public/assets/icons/warning.svg";
import React from "react";

export function MultipleValuesInputModal(props: MultipleInputProps) {
  const items = Object.entries(props?.inputValues);

  return (
    <Modal
      className={cn(items?.length > 2 ? "max-w-[540px]" : "max-w-[560px]")}
      isOpen={props.inputModalOpen}
      onDismiss={props.closeInputModal}
    >
      <div className="mb-4 flex items-center gap-2">
        <PencilIcon className="h-5 w-5" />
        <span className="text-lg font-semibold">Enter values</span>
      </div>
      <div className="relative mb-2 flex w-full flex-col items-start justify-between gap-2">
        <div
          className={cn(
            "relative mb-2 flex w-full items-start justify-between gap-5",
            { "flex-col gap-2": items?.length > 2 }
          )}
        >
          {items.map(([label, value], i) => (
            <React.Fragment key={label}>
              <label
                key={label}
                htmlFor={`input-${label}`}
                className="flex w-full flex-1 flex-col gap-2 font-normal"
              >
                {label}
                <TextInput
                  key={`input-${label}`}
                  id={`input-${label}`}
                  value={value}
                  onInput={(_val) =>
                    props.onInputChange({ label, value: _val })
                  }
                  onClear={() => props.onInputChange({ label, value: "" })}
                  maxDecimals={0}
                  type="number"
                />
              </label>
              {i === 0 && items?.length === 2 && (
                <span className="relative top-[26px] text-[40px] font-normal text-[#A2A1A5]">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <Button
          disabled={!props.canSubmitMultipleValues}
          onClick={props.onSubmitMultipleValues}
          variant="primary"
          label="Save"
          width="100%"
        />
        <Error err={props.inputError} />
      </div>
    </Modal>
  );
}

function Error({ err }: { err: string | undefined }) {
  if (!err) {
    return null;
  }
  return (
    <div className="flex items-start gap-2 leading-4">
      <Warning className="mt-[2px] h-4 w-4 shrink-0" />
      <span>{err}</span>
    </div>
  );
}
