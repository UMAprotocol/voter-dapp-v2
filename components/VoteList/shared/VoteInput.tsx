import { Dropdown, TextInput } from "components";
import { VoteListItemState } from ".";

export function VoteInput({
  showDropdown,
  options,
  selectedVote,
  onSelectVoteInDropdown,
  onSelectVoteInTextInput,
  decryptedVoteAsFormattedString,
  existingOrSelectedVote,
  isCustomInput,
  exitCustomInput,
  maxDecimals,
}: VoteListItemState) {
  return (
    <>
      {showDropdown && !!options ? (
        <Dropdown
          label="Choose answer"
          items={options}
          selected={existingOrSelectedVote}
          onSelect={onSelectVoteInDropdown}
        />
      ) : (
        <TextInput
          value={selectedVote ?? decryptedVoteAsFormattedString ?? ""}
          onInput={onSelectVoteInTextInput}
          onClear={isCustomInput ? exitCustomInput : undefined}
          maxDecimals={maxDecimals}
          type="number"
        />
      )}
    </>
  );
}
