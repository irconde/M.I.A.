import styled from 'styled-components';
import { ReactComponent as FileIconComponent } from './file.icon.svg';

export const StyledFileIcon = styled(FileIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
