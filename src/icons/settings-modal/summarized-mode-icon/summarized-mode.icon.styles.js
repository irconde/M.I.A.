import { ReactComponent as SummarizedModeIconComponent } from './summarized-mode.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledSummarizedModeIcon = styled(
    SummarizedModeIconComponent
).attrs(iconSize)`
    ${iconColor}
`;
