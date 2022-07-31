import { ReactComponent as CheckmarkIconComponent } from './checkmark.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledCheckmarkIcon = styled(CheckmarkIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
