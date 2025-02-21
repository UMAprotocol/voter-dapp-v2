import { MultipleInputProps } from "hooks/inputs/useMultipleValuesVote";
import { Modal } from "./Modal";
import { cn } from "lib/utils";
import { TextInput } from "components/Input/TextInput";
import { Button } from "components/Button";
import { Error } from "components/ErrorBanner";

export function MultipleValuesInputModal(props: MultipleInputProps) {
  const items = Object.entries(props?.inputValues);
  return (
    <Modal isOpen={props.inputModalOpen} onDismiss={props.closeInputModal}>
      <div className="relative mb-2 flex w-full flex-col items-start justify-between gap-2">
        <div
          className={cn(
            "relative mb-2 flex w-full items-start justify-between gap-5",
            { "flex-col gap-2": items?.length > 2 }
          )}
        >
          {items.map(([label, value], i) => (
            <>
              <label
                key={label}
                htmlFor={`input-${label}`}
                className="flex w-full flex-1 flex-col gap-2 font-normal"
              >
                {label}
                <TextInput
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
                <span className="top-8 relative text-4xl font-normal text-[#A2A1A5]">
                  -
                </span>
              )}
            </>
          ))}
        </div>
        <Button
          disabled={!props.canSubmitMultipleValues}
          onClick={props.onSubmitMultipleValues}
          variant="primary"
          label="Save"
        />
        <Error message={props.inputError} />
      </div>
    </Modal>
  );
}
