import { Button } from "components";
import { ReactNode } from "react";
import styled from "styled-components";

export const BarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding-inline: 25px;
  margin-top: 20px;
  margin-bottom: 40px;
  background: var(--white);
  border-radius: 5px;
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

export const BarButtonPrimary = ({ label, onClick }: { label: ReactNode; onClick: () => void }) => {
  return <Button variant="primary" label={label} onClick={onClick} width={barButtonWidth} height={barButtonHeight} />;
};

export const BarButtonSecondary = ({ label, onClick }: { label: ReactNode; onClick: () => void }) => {
  return <Button variant="secondary" label={label} onClick={onClick} width={barButtonWidth} height={barButtonHeight} />;
};
