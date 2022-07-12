import { ReactComponent as SummarizedModeCheckedIconComponent } from './summarized-mode-checked.icon.svg';
import styled from 'styled-components';

export const StyledSummarizedModeCheckedIcon = styled(
    SummarizedModeCheckedIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
