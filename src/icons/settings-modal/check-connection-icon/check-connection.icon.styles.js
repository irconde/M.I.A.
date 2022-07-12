import { ReactComponent as CheckConnectionIconComponent } from './check-connection.icon.svg';
import styled from 'styled-components';

export const StyledCheckConnectionIcon = styled(
    CheckConnectionIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
