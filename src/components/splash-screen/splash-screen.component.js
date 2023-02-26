import React, { useEffect } from 'react';
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
import { updateSplashScreenVisibility } from '../../redux/slices/ui.slice';
import { useDispatch } from 'react-redux';

const SPLASH_SCREEN_DELAY = 2000;

function SplashScreenComponent() {
    const dispatch = useDispatch();

    useEffect(() => {
        setTimeout(
            () => dispatch(updateSplashScreenVisibility(false)),
            SPLASH_SCREEN_DELAY
        );
    }, []);

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
