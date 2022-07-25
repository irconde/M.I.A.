import styled from 'styled-components';
import { ReactComponent as ConnectionIconComponent } from '../connection-status.icon.svg';
import { ReactComponent as NoConnectionIconComponent } from '../no-connection-status.icon.svg';

export const StyledConnectionIcon = styled(ConnectionIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;

export const StyledNoConnectionIcon = styled(NoConnectionIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;
