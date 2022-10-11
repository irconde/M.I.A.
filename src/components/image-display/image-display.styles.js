import styled from 'styled-components';

export const ImageViewport = styled.div.attrs(() => ({
    id: 'imageContainer',
}))`
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    position: absolute;
`;
