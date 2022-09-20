import { ReactComponent as BrightnessIconComponent } from './brightness.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledBrightnessIcon = styled(BrightnessIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
