import styled from 'styled-components';
import miaSrc from '../../icons/splash-screen/mia-logo.svg';

export const SplashScreenBG = styled.div`
    background-color: black;
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

export const MiaLogoImg = styled.img.attrs(() => ({ src: miaSrc }))`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
`;

export const RightPolygon = styled.div`
    background-color: #4b7df7;
    height: 100%;
    clip-path: polygon(70% 0, 100% 0%, 100% 100%, 20% 100%);
`;

export const LoaderContainer = styled.div`
    background-color: #fafafa;
    height: 71px;
`;
