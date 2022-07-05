import styled from 'styled-components';

export const ConnectionResult = styled.div`
    display: inline-flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
`;

export const ConnectionStatusText = styled.span`
    color: ${(props) => (props.connected ? '#519e00' : '#d94545')};
`;
