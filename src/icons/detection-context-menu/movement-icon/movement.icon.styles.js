import styled from 'styled-components';
import { ReactComponent as MovementIconComponent } from './movement.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledMovementIcon = styled(MovementIconComponent).attrs(iconSize)`
    ${iconColor}
`;
