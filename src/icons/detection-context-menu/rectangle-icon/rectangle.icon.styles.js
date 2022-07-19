import styled from 'styled-components';
import { ReactComponent as RectangleIconComponent } from './rectangle.icon.svg';

export const StyledRectangleIcon = styled(RectangleIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
