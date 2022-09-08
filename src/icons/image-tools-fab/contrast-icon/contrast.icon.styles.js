import { ReactComponent as ContrastIconComponent } from './contrast.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledContrastIcon = styled(ContrastIconComponent).attrs(iconSize)`
    ${iconColor}
`;
