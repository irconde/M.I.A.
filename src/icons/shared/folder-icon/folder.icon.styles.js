import { ReactComponent as FolderIconComponent } from './folder.icon.svg';
import styled from 'styled-components';

export const StyledFolderIcon = styled(FolderIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
