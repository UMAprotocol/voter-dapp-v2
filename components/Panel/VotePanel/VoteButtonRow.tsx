import { useEffect, useState } from "react";
import { TextInput } from "components";
import { usePanelContext } from "hooks";
import Pencil from "public/assets/icons/pencil.svg";
import styled from "styled-components";
import { VoteT } from "types";

interface Props {
  vote: VoteT;
}

export function VoteButtonRow({ vote }: Props) {
  const { selectVote, clearVote, selectedVote, phase, activityStatus } =
    usePanelContext();

  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Exit custom input when navigating to a different vote via arrows
  useEffect(() => {
    setIsCustomInput(false);
    setCustomValue("");
  }, [vote.uniqueKey]);

  const { options, decodedIdentifier, origin, decryptedVote } = vote;

  const isMultipleValuesVote = decodedIdentifier === "MULTIPLE_VALUES";

  // Only show for active commit-phase votes, not MULTIPLE_VALUES
  const shouldShow =
    activityStatus === "active" &&
    phase === "commit" &&
    !isMultipleValuesVote;

  if (!shouldShow) return null;

  const committedValue = decryptedVote?.price;
  const isDirty =
    !!selectedVote && !!committedValue && selectedVote !== committedValue;

  function handleOptionClick(value: string) {
    selectVote?.(value);
  }

  function handlePencilClick() {
    setCustomValue(selectedVote ?? "");
    setIsCustomInput(true);
  }

  function handleCustomConfirm() {
    if (customValue.trim()) {
      selectVote?.(customValue.trim());
    }
    setIsCustomInput(false);
    setCustomValue("");
  }

  function handleCustomCancel() {
    setIsCustomInput(false);
    setCustomValue("");
  }

  if (isCustomInput) {
    return (
      <Wrapper>
        <CustomInputWrapper>
          <TextInput
            value={customValue}
            onInput={setCustomValue}
            onClear={handleCustomCancel}
            placeholder="Enter custom value"
            type="text"
          />
          <ConfirmButton onClick={handleCustomConfirm} disabled={!customValue.trim()}>
            ✓
          </ConfirmButton>
        </CustomInputWrapper>
      </Wrapper>
    );
  }

  // No options: show pencil only (for numeric/free-form votes)
  if (!options || options.length === 0) {
    return (
      <Wrapper>
        <PencilButton onClick={handlePencilClick} aria-label="Enter custom value">
          <PencilIcon />
        </PencilButton>
      </Wrapper>
    );
  }

  const isPolymarket = origin === "Polymarket";
  const visibleOptions = options.slice(0, 4);

  return (
    <Wrapper>
      {visibleOptions.map((option) => {
        const isSelected = selectedVote === String(option.value);
        const buttonLabel = isPolymarket
          ? option.secondaryLabel ?? String(option.value)
          : option.label;
        const hoverTitle = isPolymarket ? option.label : undefined;

        return (
          <OptionButton
            key={String(option.value)}
            $isSelected={isSelected}
            $isDirty={isSelected && isDirty}
            onClick={() => handleOptionClick(String(option.value))}
            title={hoverTitle}
          >
            {buttonLabel}
          </OptionButton>
        );
      })}
      <PencilButton onClick={handlePencilClick} aria-label="Enter custom value">
        <PencilIcon />
      </PencilButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  border-bottom: 1px solid var(--grey-100);
  background: var(--white);
`;

const OptionButton = styled.button<{
  $isSelected: boolean;
  $isDirty: boolean;
}>`
  flex: 1;
  padding: 8px 4px;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "var(--black)" : "var(--grey-300)")};
  background: ${({ $isSelected }) =>
    $isSelected ? "var(--black)" : "var(--white)"};
  color: ${({ $isSelected }) => ($isSelected ? "var(--white)" : "var(--black)")};
  border-radius: 4px;
  font: var(--text-sm);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 150ms, color 150ms, border-color 150ms;

  &:hover:not(:disabled) {
    border-color: var(--black);
  }
`;

const PencilButton = styled.button`
  padding: 8px;
  border: 1px solid var(--grey-300);
  background: var(--white);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: border-color 150ms;

  &:hover {
    border-color: var(--black);
  }
`;

const PencilIcon = styled(Pencil)`
  width: 16px;
  height: 16px;
`;

const CustomInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ConfirmButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--black);
  background: var(--black);
  color: var(--white);
  border-radius: 4px;
  cursor: pointer;
  font: var(--text-sm);
  flex-shrink: 0;
  transition: opacity 150ms;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
