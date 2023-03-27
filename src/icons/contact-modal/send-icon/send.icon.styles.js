import styled from 'styled-components';
import { ReactComponent as SendIconComponent } from './send.icon.svg';

export const StyledSendIcon = styled(SendIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
