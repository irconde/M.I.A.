import styled from 'styled-components';
import { LinearProgress } from '@mui/material';

export const SplashScreenBG = styled.div`
    background-color: #3a3a3a;
    display: grid;
    place-items: center;
    width: 100vw;
    height: 100vh;
`;

export const SplashScreenContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const SplitBGContainer = styled.div`
    width: 641px;
    height: 369px;
    background-color: #3a6ff6;
    position: relative;
`;

export const RightPolygon = styled.div`
    background-color: #4b7df7;
    height: 100%;
    clip-path: polygon(70% 0, 100% 0%, 100% 100%, 20% 100%);
`;

export const LoaderContainer = styled.div`
    background-color: #fafafa;
    height: 71px;
    display: grid;
    place-items: center;
`;

export const LinearProgressMUI = styled(LinearProgress).attrs(() => ({
    width: '292px',
    height: '191px',
}))`
    width: 85%;

    &.MuiLinearProgress-root {
        background-color: #d8d8d8;
    }

    .MuiLinearProgress-bar {
        background-color: #adadad;
    }
`;
