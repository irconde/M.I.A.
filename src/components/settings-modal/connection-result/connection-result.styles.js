import styled from 'styled-components';

export const errorColor = '#d94545';
export const successColor = '#519e00';

export const ConnectionResult = styled.div`
    display: inline-flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    margin-left: 0.8rem;
`;

export const ConnectionStatusText = styled.span`
    color: ${(props) => (props.connected ? successColor : errorColor)};
    margin-left: 0.2rem;
`;
