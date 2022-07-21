import { ReactComponent as CloseIconComponent } from './close.icon.svg';
import styled from 'styled-components';

export const StyledCloseIcon = styled(CloseIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
