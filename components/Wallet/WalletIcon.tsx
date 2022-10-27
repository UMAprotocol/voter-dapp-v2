import styled, { CSSProperties } from "styled-components";

interface Props {
  icon: string | undefined;
  size?: number;
}
export function WalletIcon({ icon, size = 25 }: Props) {
  return icon ? (
    <WalletIconWrapper
      style={
        {
          "--size": `${size}px`,
        } as CSSProperties
      }
    >
      {/* It's not always dangerous to set inner HTML. This name is just there to remind you to NEVER set inner HTML from unsanitized input. Fortunately this string comes from Blocknative. If we can't trust them to deliver an SVG string, we have much bigger problems than this. */}
      <div dangerouslySetInnerHTML={{ __html: icon }} />
    </WalletIconWrapper>
  ) : null;
}

const WalletIconWrapper = styled.div`
  width: var(--size);
  height: var(--size);
`;
