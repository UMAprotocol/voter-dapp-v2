import { useState } from "react";
import styled from "styled-components";
import { DropdownItemT, VoteT } from "types";
import { TextInput } from "components/Input/TextInput";
import { mobileAndUnder } from "constant";

interface Props {
  vote: VoteT;
  selectedValue: string | undefined;
  onSelectVote: (value: string | undefined, vote: VoteT) => void;
}

export function VotePanelVoteInput({
  vote,
  selectedValue,
  onSelectVote,
}: Props) {
  const [customInput, setCustomInput] = useState("");

  const options = vote.options;
  const hasOptions = options && options.length > 0;

  if (hasOptions) {
    return (
      <Wrapper>
        <Label>Your vote</Label>
        <OptionsGrid>
          {options.map((option: DropdownItemT, index: number) => (
            <OptionButton
              key={option.value.toString()}
              $isSelected={selectedValue === option.value.toString()}
              onClick={() =>
                onSelectVote(
                  selectedValue === option.value.toString()
                    ? undefined
                    : option.value.toString(),
                  vote
                )
              }
            >
              <KeyHint>{index + 1}</KeyHint>
              {option.label}
            </OptionButton>
          ))}
        </OptionsGrid>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Label>Your vote</Label>
      <TextInput
        value={customInput || selectedValue || ""}
        onInput={(value) => {
          setCustomInput(value);
          onSelectVote(value || undefined, vote);
        }}
        placeholder="Enter value"
        type="number"
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-inline: 30px;
  padding-block: 16px;
  border-bottom: 1px solid var(--grey-100);

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const Label = styled.div`
  font: var(--text-sm);
  color: var(--grey-800);
  margin-bottom: 8px;
`;

const OptionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const OptionButton = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font: var(--text-sm);
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? "var(--red-500)" : "var(--grey-500)")};
  background: ${({ $isSelected }) =>
    $isSelected ? "var(--red-500)" : "transparent"};
  color: ${({ $isSelected }) =>
    $isSelected ? "var(--white)" : "var(--black)"};
  cursor: pointer;
  transition: all 150ms;

  &:hover {
    border-color: var(--red-500);
  }
`;

const KeyHint = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  font: var(--text-xs);
  background: ${() => "hsla(0, 0%, 0%, 0.08)"};
  color: inherit;
  flex-shrink: 0;
`;
