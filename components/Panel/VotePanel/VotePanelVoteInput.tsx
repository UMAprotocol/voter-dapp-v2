import styled from "styled-components";
import { DropdownItemT, VoteT } from "types";
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
  const options = vote.options;

  if (!options || options.length === 0) {
    return (
      <Wrapper>
        <HintText>
          This vote requires a custom value. Use the main vote list to enter
          your vote.
        </HintText>
      </Wrapper>
    );
  }

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

const Wrapper = styled.div`
  padding-inline: 30px;
  padding-block: 16px;
  border-bottom: 1px solid var(--grey-100);

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const HintText = styled.p`
  font: var(--text-sm);
  color: var(--grey-800);
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
