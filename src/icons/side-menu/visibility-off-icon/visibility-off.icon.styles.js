import { ReactComponent as EyeCloseIconComponent } from './visibility-off.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledVisibilityOffIcon = styled(EyeCloseIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
