import styled from 'styled-components';
import { ReactComponent as PolygonIconComponent } from './polygon.icon.svg';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledPolygonIcon = styled(PolygonIconComponent).attrs(iconSize)`
    .coloredTag {
        stroke: ${(props) => props.border};
        ${iconColor}
    }
`;
