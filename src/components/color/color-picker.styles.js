import styled from 'styled-components';

export const ColorPickerContainer = styled.div`
    position: absolute;
    ${({ left, top }) => `
    left: ${left}px;
    top: ${top}px;
  `}
    transform: translateX(-36%);
`;
