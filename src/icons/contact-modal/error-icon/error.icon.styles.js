import styled from 'styled-components';
import { ReactComponent as ErrorIconComponent } from './error.icon.svg';

export const StyledErrorIcon = styled(ErrorIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
