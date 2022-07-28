import styled, { CSSProperties } from "styled-components";

interface Props {
  icon?: string;
  size?: number;
}
export function WalletIcon({ icon, size = 25 }: Props) {
  return icon ? (
    <WalletIconWrapper
      style={
        {
          "--size": size + "px",
        } as CSSProperties
      }
    >
      <div dangerouslySetInnerHTML={{ __html: icon }} />
    </WalletIconWrapper>
  ) : null;
}

const WalletIconWrapper = styled.div`
  width: var(--size);
  height: var(--size);
`;
