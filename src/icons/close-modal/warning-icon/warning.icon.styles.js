import styled from 'styled-components';
import { ReactComponent as WarningIconComponent } from './warning.icon.svg';

export const StyledWarningIcon = styled(WarningIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
