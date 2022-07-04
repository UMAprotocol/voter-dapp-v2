import { Menu, MenuList, MenuButton, MenuItem, MenuContextValue } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { ReactNode } from "react";
import styled, { CSSProperties, keyframes } from "styled-components";
import Chevron from "public/assets/icons/chevron.svg";
import { black } from "constants/colors";

export type Item = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

interface Props {
  items: Item[];
  label: ReactNode;
  selected: Item | null;
  onSelect: (item: Item) => void;
  borderColor?: string;
}
export function Dropdown({ items, label, selected, onSelect, borderColor = black }: Props) {
  return (
    <Wrapper>
      {({ isExpanded }: MenuContextValue) => (
        <>
          <ToggleButton style={{ "--border-color": borderColor } as CSSProperties}>
            {selected ? selected.label : label}
            <ChevronIcon $isExpanded={isExpanded} />
          </ToggleButton>
          <DropdownList>
            {items.map((item) => (
              <DropdownItem
                $isSelected={selected?.value === item.value}
                onSelect={() => onSelect(item)}
                key={item.label}
                style={{ "--border-color": borderColor } as CSSProperties}
              >
                <Label>{item.label}</Label>
                {item.secondaryLabel ? <SecondaryLabel>({item.secondaryLabel})</SecondaryLabel> : null}
              </DropdownItem>
            ))}
          </DropdownList>
        </>
      )}
    </Wrapper>
  );
}

const slideDown = keyframes`
0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled(Menu)``;

const ToggleButton = styled(MenuButton)`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--black-opacity-50);
  background-color: var(--white);
  border: 1.18px solid var(--border-color);
  border-radius: 5px;
`;

const DropdownList = styled(MenuList)`
  width: 100%;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 0;
  animation: ${slideDown} 0.2s ease-in-out;
`;

const DropdownItem = styled(MenuItem)<{ $isSelected: boolean }>`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 15px;
  font: var(--text-md);
  color: var(--black);
  border-radius: 5px;
  background-color: ${({ $isSelected }) => ($isSelected ? "var(--gray-50)" : "var(--white)")};
  &:hover {
    background-color: var(--gray-50);
    color: currentColor;
  }
  &:not(:last-child) {
    border-bottom: 1px solid var(--gray-50);
  }
`;

const Label = styled.p``;

const SecondaryLabel = styled.p`
  color: var(--black-opacity-50);
`;

const ChevronIcon = styled(Chevron)<{ $isExpanded: boolean }>`
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? "0deg" : "180deg")});
  transition: transform 0.2s ease-in-out;
`;
