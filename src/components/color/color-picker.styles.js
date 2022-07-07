import styled from 'styled-components';

export const ColorPickerContainer = styled.div`
    position: absolute;
    top: ${(props) => `${props.top}px`};
    left: ${(props) => `${props.left}px`};
`;
