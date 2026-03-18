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

  const optionsWithoutCustom = options.filter(
    (option) => option.value !== "custom"
  );
  return (
    <Wrapper>
      <VoteWrapper>
        <b>Quick vote:</b>
        <OptionsGrid>
          {optionsWithoutCustom.map((option: DropdownItemT, index: number) => (
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
      </VoteWrapper>
      <div>
        {optionsWithoutCustom.map((option: DropdownItemT, index: number) => (
          <SmallText key={option.value}>
            {index !== 0 && " · "}P{index + 1} = {option.label}
          </SmallText>
        ))}
      </div>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-inline: 30px;
  padding-block: 16px;
  border-bottom: 1px solid var(--grey-100);
  display: flex;
  flex-direction: column;
  justify-content: left;

  @media ${mobileAndUnder} {
    padding-inline: 10px;
  }
`;

const VoteWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HintText = styled.p`
  font: var(--text-sm);
  color: var(--grey-800);
`;

const SmallText = styled.span`
  font: var(--text-sm);
  color: var(--grey-800);
  opacity: 0.8;
`;

const OptionsGrid = styled.div`
  display: flex;
  justify-content: right;
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
