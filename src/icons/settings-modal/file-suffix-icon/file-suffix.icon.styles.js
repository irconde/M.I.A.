import { ReactComponent as FileSuffixIconComponent } from './file-suffix.icon.svg';
import styled from 'styled-components';

export const StyledFileSuffixIcon = styled(FileSuffixIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
`;
