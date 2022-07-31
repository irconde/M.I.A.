import { ReactComponent as FolderIconComponent } from './folder.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledFolderIcon = styled(FolderIconComponent).attrs(iconSize)`
    ${iconColor}
`;
