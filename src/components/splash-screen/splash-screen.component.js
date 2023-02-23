import React from 'react';
import {
    LoaderContainer,
    MiaLogoImg,
    RightPolygon,
    SplashScreenBG,
    SplashScreenContainer,
    SplitBGContainer,
} from './splash-screen.styles';

function SplashScreenComponent() {
    return (
        <SplashScreenBG>
            <SplashScreenContainer>
                <SplitBGContainer>
                    <MiaLogoImg />
                    <RightPolygon />
                </SplitBGContainer>
                <LoaderContainer></LoaderContainer>
            </SplashScreenContainer>
        </SplashScreenBG>
    );
}

export default SplashScreenComponent;
