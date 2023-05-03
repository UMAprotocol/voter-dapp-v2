import { tabletAndUnder, tabletMax } from "constant";
import { useWindowSize } from "hooks";
import styled from "styled-components";

interface Props {
  headings: JSX.Element;
  rows: JSX.Element[];
}
export function VoteList({ headings, rows }: Props) {
  const { width } = useWindowSize();

  if (!width) return null;

  const isTabletAndUnder = width <= tabletMax;

  return (
    <Wrapper as={isTabletAndUnder ? "div" : "table"}>
      {!isTabletAndUnder && <Thead>{headings}</Thead>}
      {isTabletAndUnder ? <>{rows}</> : <Tbody>{rows}</Tbody>}
    </Wrapper>
  );
}

const Wrapper = styled.table`
  width: 100%;
  border-spacing: 0 5px;

  @media ${tabletAndUnder} {
    display: grid;
    gap: 5px;
  }
`;

const Thead = styled.thead``;

const Tbody = styled.tbody``;
