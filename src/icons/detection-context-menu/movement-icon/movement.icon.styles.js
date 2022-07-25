import styled from 'styled-components';
import { ReactComponent as MovementIconComponent } from './movement.icon.svg';

export const StyledMovementIcon = styled(MovementIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
`;
