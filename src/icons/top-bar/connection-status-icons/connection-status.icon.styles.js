import styled from 'styled-components';
import { ReactComponent as ConnectionIconComponent } from './svgs/connection-status.icon.svg';
import { ReactComponent as NoConnectionIconComponent } from './svgs/no-connection-status.icon.svg';

export const StyledConnectionIcon = styled(ConnectionIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    fill: ${(props) => props.color};
`;

export const StyledNoConnectionIcon = styled(NoConnectionIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    fill: ${(props) => props.color};
`;
