import { ReactComponent as SummarizedModeCheckedIconComponent } from './summarized-mode-checked.icon.svg';
import styled from 'styled-components';

export const StyledSummarizedModeCheckedIcon = styled(
    SummarizedModeCheckedIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
