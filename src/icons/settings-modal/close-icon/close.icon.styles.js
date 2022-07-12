import { ReactComponent as CloseIconComponent } from './close.icon.svg';
import styled from 'styled-components';

export const StyledCloseIcon = styled(CloseIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
