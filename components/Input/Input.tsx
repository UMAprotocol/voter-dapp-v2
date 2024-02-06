import styled from "styled-components";

export const Wrapper = styled.div`
  font: var(--text-md);
  max-width: 800px;
  min-width: 224px;
`;

export const Input = styled.input`
  width: 100%;
  height: 45px;
  border: 1px solid var(--black);
  border-radius: 5px;
  color: var(--black-opacity-50);

  :disabled {
    cursor: not-allowed;
  }

  ::placeholder {
    color: var(--black-opacity-50);
  }
`;
