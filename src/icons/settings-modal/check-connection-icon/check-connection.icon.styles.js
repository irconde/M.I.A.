import { ReactComponent as CheckConnectionIconComponent } from './check-connection.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledCheckConnectionIcon = styled(
    CheckConnectionIconComponent
).attrs(iconSize)`
    ${iconColor}
`;
