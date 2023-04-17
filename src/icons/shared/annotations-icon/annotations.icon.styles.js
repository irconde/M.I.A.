import styled from 'styled-components';
import { ReactComponent as AnnotationsIconComponent } from './annotations.icon.svg';

export const StyledAnnotationsIcon = styled(AnnotationsIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
