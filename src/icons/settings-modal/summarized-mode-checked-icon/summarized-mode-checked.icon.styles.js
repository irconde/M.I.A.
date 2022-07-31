import { ReactComponent as SummarizedModeCheckedIconComponent } from './summarized-mode-checked.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledSummarizedModeCheckedIcon = styled(
    SummarizedModeCheckedIconComponent
).attrs(iconSize)`
    ${iconColor}
`;
