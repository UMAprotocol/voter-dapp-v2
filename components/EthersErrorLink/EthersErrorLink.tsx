import { ethersErrorCodes } from "constant";
import NextLink from "next/link";
import styled from "styled-components";

export function EthersErrorLink({ errorMessage }: { errorMessage: string }) {
  if (!ethersErrorCodes.some((code) => errorMessage.includes(code))) {
    return <span>{errorMessage}</span>;
  }

  const [firstPart, secondPart] = errorMessage.split("[");

  const link = secondPart.replace("See:", "").replace("]", "").trim();

  return (
    <span>
      {firstPart}. <Link href={link}>Learn more.</Link>
    </span>
  );
}

const Link = styled(NextLink)`
  font: inherit;
  color: inherit;
  text-decoration: underline;
`;
