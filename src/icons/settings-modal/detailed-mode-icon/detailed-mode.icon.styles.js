import { ReactComponent as DetailedModeIconComponent } from './detailed-mode.icon.svg';
import styled from 'styled-components';

export const StyledDetailedModeIcon = styled(DetailedModeIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
