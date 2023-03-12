import styled from 'styled-components';
import { LinearProgress } from '@mui/material';

export const SavingModalBG = styled.div`
    display: grid;
    place-items: center;
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 100000;
`;

export const SavingModalContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const SplitBGContainer = styled.div`
    width: 431px;
    height: 173px;
    background-color: #3a6ff6;
    position: relative;
`;

export const ModalContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 100%;
    color: #fafafa;
    z-index: 1000;
`;

export const TitleContent = styled.div`
    display: flex;
    justify-content: center;
    height: 70%;
    width: 100%;
    font-family: NotoSansJP-Medium, sans-serif;
`;

export const GrainIconContainer = styled.div`
    margin-top: 28px;
    margin-left: 31px;
`;

export const Title = styled.div`
    font-size: 24px;
    line-height: 1.5;
    padding: 3%;
    padding-top: 29px;
    width: 80%;
`;

export const RightPolygon = styled.div`
    background-color: #4b7df7;
    height: 100%;
    clip-path: polygon(70% 0, 100% 0%, 100% 100%, 20% 100%);
`;

export const LoaderContainer = styled.div`
    background-color: #fafafa;
    height: 42px;
    display: grid;
    place-items: center;
`;

export const LinearProgressMUI = styled(LinearProgress).attrs(() => ({
    width: '292px',
    height: '172px',
}))`
    width: 85%;

    &.MuiLinearProgress-root {
        background-color: #d8d8d8;
    }

    .MuiLinearProgress-bar {
        background-color: #adadad;
    }
`;
