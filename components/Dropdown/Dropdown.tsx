import { Menu, MenuList, MenuButton, MenuItem, MenuContextValue } from "@reach/menu-button";
import "@reach/menu-button/styles.css";
import styled from "styled-components";

export type Item = {
  value: string;
  label: string;
  secondaryLabel?: string;
};

interface Props {
  items: Item[];
  selected: Item;
  onSelect: (item: Item) => void;
}
export function Dropdown({ items, selected, onSelect }: Props) {
  return (
    <Wrapper>
      {({ isExpanded }: MenuContextValue) => (
        <>
          <ToggleButton>{isExpanded ? "Close" : "Open"}</ToggleButton>
          <DropdownList>
            {items.map((item) => (
              <DropdownItem isSelected={selected.value === item.value} onSelect={() => onSelect(item)} key={item.label}>
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

const DropdownItem = styled(MenuItem)<{ isSelected: boolean }>``;

const Label = styled.p``;

const SecondaryLabel = styled.p``;
