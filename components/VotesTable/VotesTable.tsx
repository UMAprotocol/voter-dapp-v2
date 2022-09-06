import styled from "styled-components";

interface Props {
  headings: JSX.Element;
  rows: JSX.Element[];
}
export default function VotesTable({ headings, rows }: Props) {
  return (
    <Table>
      <Thead>{headings}</Thead>
      <Tbody>{rows}</Tbody>
    </Table>
  );
}

const Table = styled.table`
  table-layout: fixed;
  width: 100%;
  border-spacing: 30px 5px;
`;

const Thead = styled.thead``;

const Tbody = styled.tbody``;
