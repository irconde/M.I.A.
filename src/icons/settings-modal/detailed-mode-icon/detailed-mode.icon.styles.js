import { ReactComponent as DetailedModeIconComponent } from './detailed-mode.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledDetailedModeIcon = styled(DetailedModeIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
