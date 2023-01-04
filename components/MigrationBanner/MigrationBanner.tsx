import { IconWrapper } from "components";
import { mobileAndUnder, tabletAndUnder } from "constant";
import NextLink from "next/link";
import Close from "public/assets/icons/close.svg";
import Logo from "public/assets/icons/uma-2.svg";
import styled from "styled-components";
import { useLocalStorage } from "usehooks-ts";

export function MigrationBanner() {
  const [show, setShow] = useLocalStorage("show-migration-banner", true);

  function close() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <Wrapper>
      <LogoIcon />
      <Text>
        Welcome to UMA 2.0 voting app.{" "}
        <Link href="https://todo.com" target="_blank">
          Read our staking & migration instructions here
        </Link>
      </Text>
      <TabletText>
        Welcome to UMA 2.0.{" "}
        <Link href="https://todo.com" target="_blank">
          Read the migrate and stake instructions
        </Link>
      </TabletText>
      <MobileText>
        Welcome!{" "}
        <Link href="https://todo.com" target="_blank">
          Learn to migrate and stake
        </Link>
      </MobileText>

      <CloseButton onClick={close}>
        <IconWrapper>
          <CloseIcon />
        </IconWrapper>
      </CloseButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  --height: 60px;
  background: var(--black);
  height: var(--height);
  display: flex;
  align-items: center;
  padding-inline: var(--page-padding);
`;

const LogoIcon = styled(Logo)`
  margin-right: var(--page-padding);
`;

const Text = styled.p`
  font: var(--text-md);
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
  --icon-offset: 10px;
  position: absolute;
  top: calc(var(--height) - var(--icon-height) / 2px);
  right: calc(var(--page-padding) + var(--icon-offset));
  fill: var(--white);
  background: transparent;
`;
