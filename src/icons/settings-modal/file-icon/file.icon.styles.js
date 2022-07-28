import styled from 'styled-components';
import { ReactComponent as FileIconComponent } from './file.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledFileIcon = styled(FileIconComponent).attrs(iconSize)`
    ${iconColor}
`;
