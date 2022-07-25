import styled from 'styled-components';
import { ReactComponent as AnnotationsIconComponent } from './annotations.icon.svg';

export const StyledAnnotationsIcon = styled(AnnotationsIconComponent).attrs(
    (props) => ({
        width: props.width || '20px',
        height: props.height || '20px',
    })
)`
    fill: ${(props) => props.color};
`;
