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
              P{index + 1}
            </OptionButton>
          ))}
        </OptionsGrid>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
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

const OptionsGrid = styled.div`
  display: flex;
  justify-content: space-between;
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
