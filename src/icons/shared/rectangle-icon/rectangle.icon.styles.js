import styled from 'styled-components';
import { ReactComponent as RectangleIconComponent } from './rectangle.icon.svg';

export const StyledRectangleIcon = styled(RectangleIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    .coloredTag {
        fill: ${(props) => props.color};
        stroke: ${(props) => props.borderColor};
    }
`;
