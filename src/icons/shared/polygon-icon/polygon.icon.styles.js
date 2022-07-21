import styled from 'styled-components';
import { ReactComponent as PolygonIconComponent } from './polygon.icon.svg';

export const StyledPolygonIcon = styled(PolygonIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;

    .coloredTag {
        fill: ${(props) => props.color};
        stroke: ${(props) => props.borderColor};
    }
`;
