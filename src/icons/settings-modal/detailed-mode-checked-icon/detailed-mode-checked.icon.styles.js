import { ReactComponent as DetailedModeCheckedIconComponent } from './detailed-mode-checked.icon.svg';
import styled from 'styled-components';

export const StyledDetailedModeCheckedIcon = styled(
    DetailedModeCheckedIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
