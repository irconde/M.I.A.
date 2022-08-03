import styled from 'styled-components';
import { ReactComponent as NoFileIconComponent } from './no-file.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledNoFileIcon = styled(NoFileIconComponent).attrs(iconSize)`
    ${iconColor}
`;
