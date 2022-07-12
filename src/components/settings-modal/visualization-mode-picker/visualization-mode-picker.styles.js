import styled from 'styled-components';

export const VisualizationModeContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 3.5rem;
    margin-bottom: 1rem;
`;
export const VisualizationModeLabel = styled.p`
    margin: 0.2rem 0;
    text-align: center;
    color: ${(props) => (props.selected ? '#ffffff' : '#9d9d9d')};
    font-size: 0.7rem;
`;

export const VisualizationModeIconWrapper = styled.div`
    cursor: pointer;
    background-color: #464646;
    border-radius: 10px;
    height: fit-content;
    outline: ${(props) => props.selected && '2px solid #367fff'};
`;
