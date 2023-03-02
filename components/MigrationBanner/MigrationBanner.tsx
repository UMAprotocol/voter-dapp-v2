import { IconWrapper } from "components";
import { mobileAndUnder, tabletAndUnder } from "constant";
import NextLink from "next/link";
import Close from "public/assets/icons/close.svg";
import Logo from "public/assets/icons/uma-2.svg";
import styled, { CSSProperties } from "styled-components";
import { useIsClient, useLocalStorage } from "usehooks-ts";

export function MigrationBanner() {
  const [show, setShow] = useLocalStorage("show-migration-banner", true);
  const isClient = useIsClient();

  if (!isClient) return null;

  function close() {
    setShow(false);
  }

  const height = show ? 60 : 0;

  return (
    <OuterWrapper
      style={
        {
          "--height": `${height}px`,
        } as CSSProperties
      }
    >
      <InnerWrapper>
        <LogoIcon />
        <Text>
          Welcome to the UMA 2.0 voting app. Read our{" "}
          <Link href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091" target="_blank">
            migration and staking instructions here.
          </Link>
        </Text>
        <TabletText>
          Welcome to UMA 2.0. Learn now to{" "}
          <Link href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091" target="_blank">
            migrate and stake.
          </Link>
        </TabletText>
        <MobileText>
          Welcome to UMA 2.0.{" "}
          <Link href="https://medium.com/uma-project/uma-token-staking-is-live-here-is-how-you-participate-bf959cc39091" target="_blank">
            Migrate now.
          </Link>
        </MobileText>

        <CloseButton onClick={close}>
          <IconWrapper>
            <CloseIcon />
          </IconWrapper>
        </CloseButton>
      </InnerWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  height: var(--height);
  background: var(--black);
  display: grid;
  align-items: center;
  transition: height 0.2s;
  overflow: hidden;
`;

const InnerWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: var(--page-width);
  padding-inline: var(--page-padding);
  margin-inline: auto;

  @media ${tabletAndUnder} {
    padding-inline: 0;
  }
`;

const LogoIcon = styled(Logo)`
  margin-right: var(--page-padding);
  width: clamp(3.5rem, calc(2.08rem + 7.6vw), 4.69rem);
  @media ${mobileAndUnder} {
    margin-right: clamp(0.25rem, calc(-0.05rem + 1.6vw), 0.5rem);
  }
`;

const Text = styled.p`
  font: var(--text-md);
  font-size: clamp(0.75rem, calc(0.45rem + 1.6vw), 1rem);
  color: var(--white);
  @media ${tabletAndUnder} {
    display: none;
  }
`;

const TabletText = styled(Text)`
  display: none;
  @media ${tabletAndUnder} {
    display: block;
  }
  @media ${mobileAndUnder} {
    display: none;
  }
`;

const MobileText = styled(Text)`
  display: none;
  @media ${mobileAndUnder} {
    display: block;
  }
`;

const Link = styled(NextLink)`
  color: var(--red-500);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const CloseIcon = styled(Close)`
  path {
    fill: var(--white);
  }
`;
const CloseButton = styled.button`
  --icon-height: 15px;
  --icon-offset: 12px;
  --icon-start-right: var(--page-padding);
  --right: calc(var(--icon-start-right) + var(--icon-offset));
  position: absolute;
  top: calc(var(--height) - var(--icon-height) / 2px);
  right: var(--right);
  fill: var(--white);
  background: transparent;

  @media ${tabletAndUnder} {
    --icon-start-right: 0px;
  }
`;
