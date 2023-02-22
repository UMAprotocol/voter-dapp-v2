import { useStakingContext } from "hooks";
import NextLink from "next/link";
import styled from "styled-components";
import { useIsClient, useLocalStorage } from "usehooks-ts";
import {
  CloseButton,
  CloseIcon,
  ErrorMessage,
  ErrorMessageWrapper,
  IconWrapper,
  WarningIcon,
  Wrapper,
} from "./styles";

export function OldDesignatedVotingAccountWarningBanner() {
  const {
    oldDesignatedVotingAccount: {
      isOldDesignatedVotingAccount,
      message,
      designatedVotingContract,
    },
  } = useStakingContext();
  const [closeClicked, setClosedClicked] = useLocalStorage(
    "show-old-designated-voting-account-warning-banner",
    false
  );

  const isClient = useIsClient();

  const show = isOldDesignatedVotingAccount && !closeClicked;

  if (!isClient || !show) return null;

  function close() {
    setClosedClicked(true);
  }

  return (
    <Wrapper>
      <ErrorMessageWrapper>
        <IconWrapper>
          <WarningIcon />
        </IconWrapper>
        <ErrorMessage>
          {message}:{" "}
          <Link
            href={`https://etherscan.io/address/${designatedVotingContract}`}
            target="_blank"
          >
            {designatedVotingContract}
          </Link>
          .
          <br />
          Please{" "}
          <Link href="https://discord.com/invite/jsb9XQJ" target="_blank">
            contact us on Discord
          </Link>{" "}
          for assistance with migration.
        </ErrorMessage>
        <CloseButton onClick={close}>
          <IconWrapper>
            <CloseIcon />
          </IconWrapper>
        </CloseButton>
      </ErrorMessageWrapper>
    </Wrapper>
  );
}

const Link = styled(NextLink)`
  font: inherit;
  color: inherit;
  text-decoration: underline;
  transition: opacity var(--animation-duration);

  &:hover {
    opacity: 0.75;
  }
`;
