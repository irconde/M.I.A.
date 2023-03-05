import styled from 'styled-components';

export const SaveFabContainer = styled.div`
    outline: 1px solid red;
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: ${({ bottom }) => '25px'};
    right: ${({ right }) => '25px'};
    width: 5rem;
    align-items: center;
    height: ${({ open }) => (open ? 'fit-content' : '5rem')};
`;

export const SaveFabButton = styled.button`
    aspect-ratio: 1;
    background-color: lightgrey;
    border-radius: 50%;
    cursor: pointer;
    width: 100%;
`;

export const FabActionButton = styled(SaveFabButton)`
    width: 80%;
`;
