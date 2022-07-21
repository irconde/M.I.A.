import { ReactComponent as SummarizedModeIconComponent } from './summarized-mode.icon.svg';
import styled from 'styled-components';

export const StyledSummarizedModeIcon = styled(
    SummarizedModeIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
