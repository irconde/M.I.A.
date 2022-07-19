import styled from 'styled-components';
import { ReactComponent as MovementIconComponent } from './movement.icon.svg';

export const StyledMovementIcon = styled(MovementIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
