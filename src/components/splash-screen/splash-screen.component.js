import React from 'react';
import {
    LinearProgressMUI,
    LoaderContainer,
    RightPolygon,
    SplashScreenBG,
    SplashScreenContainer,
    SplitBGContainer,
} from './splash-screen.styles';
import { MiaLogoContainer } from '../../icons/mia-logo-icon/mia-logo.icon.styles';
import MiaLogoIcon from '../../icons/mia-logo-icon/mia-logo.icon';

function SplashScreenComponent() {
    return (
        <SplashScreenBG>
            <SplashScreenContainer>
                <SplitBGContainer>
                    <MiaLogoContainer>
                        <MiaLogoIcon />
                    </MiaLogoContainer>
                    <RightPolygon />
                </SplitBGContainer>
                <LoaderContainer>
                    <LinearProgressMUI />
                </LoaderContainer>
            </SplashScreenContainer>
        </SplashScreenBG>
    );
}

export default SplashScreenComponent;
