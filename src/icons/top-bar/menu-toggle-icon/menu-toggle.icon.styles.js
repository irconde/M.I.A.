import styled from 'styled-components';
import { ReactComponent as MenuToggleIconComponent } from './menu-toggle.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledMenuToggleIcon = styled(MenuToggleIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
