import { ReactComponent as CheckmarkIconComponent } from './checkmark.icon.svg';
import styled from 'styled-components';

export const StyledCheckmarkIcon = styled(CheckmarkIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
