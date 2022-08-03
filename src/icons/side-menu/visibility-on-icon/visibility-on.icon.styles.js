import { ReactComponent as EyeOpenIconComponent } from './visibility-on.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledVisibilityOnIcon = styled(EyeOpenIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
