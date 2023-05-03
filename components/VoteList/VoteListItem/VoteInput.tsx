import { Dropdown } from "components/Dropdown";
import { TextInput } from "components/Input/TextInput";
import { VoteListItemHookResult } from "./useVoteListItem";

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
}: VoteListItemHookResult) {
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
