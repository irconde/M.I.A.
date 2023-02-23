import React from 'react';
import {
    LoaderContainer,
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
                    <RightPolygon />
                </SplitBGContainer>
                <LoaderContainer></LoaderContainer>
            </SplashScreenContainer>
        </SplashScreenBG>
    );
}

export default SplashScreenComponent;
