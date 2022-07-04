import { Menu, MenuList, MenuButton, MenuItem, MenuContextValue } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import { ReactNode } from "react";
import styled from "styled-components";
import Chevron from "public/assets/icons/chevron.svg";

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
}
export function Dropdown({ items, label, selected, onSelect }: Props) {
  return (
    <Wrapper>
      {({ isExpanded }: MenuContextValue) => (
        <>
          <ToggleButton>
            {selected ? selected.label : label}
            <ChevronIcon $isExpanded={isExpanded} />
          </ToggleButton>
          <DropdownList>
            {items.map((item) => (
              <DropdownItem
                $isSelected={selected?.value === item.value}
                onSelect={() => onSelect(item)}
                key={item.label}
              >
                <Label>{item.label}</Label>
                {item.secondaryLabel ? <SecondaryLabel>{item.secondaryLabel}</SecondaryLabel> : null}
              </DropdownItem>
            ))}
          </DropdownList>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled(Menu)``;

const ToggleButton = styled(MenuButton)``;

const DropdownList = styled(MenuList)``;

const DropdownItem = styled(MenuItem)<{ $isSelected: boolean }>``;

const Label = styled.p``;

const SecondaryLabel = styled.p``;

const ChevronIcon = styled(Chevron)<{ $isExpanded: boolean }>`
  * {
    fill: none;
  }
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? "0deg" : "180deg")});
  transition: transform 0.2s ease-in-out;
`;
