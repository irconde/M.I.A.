import { ReactComponent as DetailedModeCheckedIconComponent } from './detailed-mode-checked.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledDetailedModeCheckedIcon = styled(
    DetailedModeCheckedIconComponent
).attrs(iconSize)`
    ${iconColor}
`;
