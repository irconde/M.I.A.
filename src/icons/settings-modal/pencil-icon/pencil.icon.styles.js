import styled from 'styled-components';
import { ReactComponent as PencilIconComponent } from './pencil.icon.svg';

export const StyledPencilIcon = styled(PencilIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
