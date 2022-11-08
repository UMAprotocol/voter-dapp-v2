import { Button } from "components";
import { mobileAndUnder, tabletAndUnder } from "constant";
import { ReactNode } from "react";
import styled from "styled-components";

export const BarWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  grid-auto-columns: auto;
  align-items: center;
  height: 80px;
  padding-inline: 25px;
  margin-top: 20px;
  margin-bottom: 40px;
  background: var(--white);
  border-radius: 5px;

  > :last-child {
    justify-self: right;
  }

  @media ${tabletAndUnder} {
    grid-auto-columns: auto;
  }

  @media ${mobileAndUnder} {
    height: auto;
    grid-auto-columns: unset;
    grid-auto-flow: row;
    grid-auto-rows: auto;
    gap: 10px;
    padding: 15px;

    > :last-child {
      justify-self: unset;
    }
  }
`;

export const WalletWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

export const Address = styled.p`
  font: var(--text-sm);
  margin-top: 12px;
  margin-bottom: 15px;

  @media ${tabletAndUnder} {
    display: none;
  }
`;

export const TruncatedAddress = styled(Address)`
  display: none;

  @media ${tabletAndUnder} {
    display: block;
  }
`;

export const Header = styled.h1`
  font: var(--header-md);
  text-transform: capitalize;
`;

export const Text = styled.p`
  font: var(--text-sm);
  max-width: 737px;
`;

export const BarText = styled.p`
  font: var(--text-md);
`;

export const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const barButtonWidth = 160;
const barButtonHeight = 40;

export const BarButtonPrimary = ({
  label,
  onClick,
}: {
  label: ReactNode;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="primary"
      label={label}
      onClick={onClick}
      width={barButtonWidth}
      height={barButtonHeight}
    />
  );
};

export const BarButtonSecondary = ({
  label,
  onClick,
}: {
  label: ReactNode;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="secondary"
      label={label}
      onClick={onClick}
      width={barButtonWidth}
      height={barButtonHeight}
    />
  );
};
