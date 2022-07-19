import styled from 'styled-components';
import { ReactComponent as AnnotationsIconComponent } from './annotations.icon.svg';

export const StyledAnnotationsIcon = styled(AnnotationsIconComponent).attrs(
    (props) => ({
        width: props.width || '20px',
        height: props.height || '20px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin-right: 4px;
    margin-left: 4px;
`;
