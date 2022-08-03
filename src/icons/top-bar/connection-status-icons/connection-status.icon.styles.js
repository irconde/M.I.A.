import styled from 'styled-components';
import { ReactComponent as ConnectionIconComponent } from './svgs/connection-status.icon.svg';
import { ReactComponent as NoConnectionIconComponent } from './svgs/no-connection-status.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledConnectionIcon = styled(ConnectionIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;

export const StyledNoConnectionIcon = styled(NoConnectionIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
