import styled from 'styled-components';
import { ReactComponent as SendIconComponent } from './send.icon.svg';

export const StyledSendIcon = styled(SendIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
    viewBox: '0 0 24 24',
}))`
    fill: ${(props) => props.color || 'white'};
`;
