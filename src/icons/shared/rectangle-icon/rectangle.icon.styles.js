import styled from 'styled-components';
import { ReactComponent as RectangleIconComponent } from './rectangle.icon.svg';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledRectangleIcon = styled(RectangleIconComponent).attrs(
    iconSize
)`
    .coloredTag {
        stroke: ${(props) => props.border};
        ${iconColor}
    }
`;
