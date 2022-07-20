import { ReactComponent as PolygonIconComponent } from './polygon.icon.svg';
import styled from 'styled-components';

export const StyledPolygonIcon = styled(PolygonIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
