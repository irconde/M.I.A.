import styled from 'styled-components';

export const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '4px solid #367eff' : '1px solid fff'};
    overflow-x: hidden;
    margin: 0 16px 60px 0;
    border-radius: 6px;
    background-color: #242424;
    justify-content: center;
    width: 197px;
    height: ${(props) =>
        props.loading === 'true' ? '145px' : `${props.thumbnailHeight}px`};
    cursor: pointer;
`;