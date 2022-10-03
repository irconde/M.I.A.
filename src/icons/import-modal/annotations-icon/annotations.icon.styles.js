import styled from 'styled-components';
import { ReactComponent as AnnotationsIconComponent } from './annotations.icon.svg';

export const StyledAnnotationsIcon = styled(AnnotationsIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
        viewBox: '0 0 24 24',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
