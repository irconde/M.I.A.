import styled from 'styled-components';
import { ReactComponent as CheckMarkIconComponent } from './check-mark.icon.svg';

export const StyledCheckMarkIcon = styled(CheckMarkIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
