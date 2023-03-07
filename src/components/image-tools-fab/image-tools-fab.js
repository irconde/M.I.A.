import React, { useState } from 'react';
import {
    SliderGroup,
    SliderWrapper,
    SpeedDialIconWrapper,
    SpeedDialWrapper,
    StyledAction,
    StyledSlider,
    StyledSpeedDial,
    StyledTooltip,
} from './image-tools-fab.styles';
import { useDispatch, useSelector } from 'react-redux';
import * as constants from '../../utils/enums/Constants';
import ScaleIcon from '../../icons/image-tools-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/image-tools-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/image-tools-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/image-tools-fab/brightness-icon/brightness.icon';
import {
    getCornerstoneMode,
    getCurrFileName,
    getIsFABVisible,
    getIsImageToolsOpen,
    getSideMenuVisible,
    updateIsImageToolsOpen,
} from '../../redux/slices/ui.slice';
import { cornerstone } from '../image-display/image-display.component';

const ImageToolsFab = () => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const currentFile = useSelector(getCurrFileName);
    const isSideMenuVisible = useSelector(getSideMenuVisible);
    const isVisible = useSelector(getIsFABVisible);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const dispatch = useDispatch();
    const [isInverted, setInverted] = useState(false);
    const [sliderVisibility, setSliderVisibility] = useState({
        brightnessSlider: false,
        contrastSlider: false,
    });
    const MAX_CONTRAST = 80000;
    const MAX_BRIGHTNESS = 80000;
    const MAX_SLIDER_VAL = 100;
    const [contrast, setContrast] = useState(50);
    const [brightness, setBrightness] = useState(50);

    /**
     * Updates the contrast of the viewports based on the value of the
     * contrast slide
     *
     * @param {Event} e
     * @param {number} value - between 0 and 100
     */
    const handleContrastChange = (e, value) => {
        const imageElement = document.getElementById('imageContainer');
        if (imageElement !== null) {
            setContrast(value);
            const viewport = cornerstone.getViewport(imageElement);
            updateViewportContrast(value, viewport);
            cornerstone.setViewport(imageElement, viewport);
        }
    };

    /**
     * Updates the brightness of the viewports based on the value of the
     * brightness slider.
     *
     * @param {Event} e
     * @param {number} value
     */
    const handleBrightnessChange = (e, value) => {
        setBrightness(value);
        const imageElement = document.getElementById('imageContainer');
        if (imageElement !== null) {
            const viewport = cornerstone.getViewport(imageElement);
            updateViewportBrightness(value, viewport);
            cornerstone.setViewport(imageElement, viewport);
        }
    };

    /**
     * Scales the slider value to the corresponding cornerstone tools values
     * for contrast
     *
     * @param {number} contrast - between 0 and 100 value from the slider
     * @param {Object} viewport
     */
    const updateViewportContrast = (contrast, viewport) => {
        // convert from slider scale to cornerstone scale
        viewport.voi.windowWidth =
            (MAX_CONTRAST / MAX_SLIDER_VAL) * (MAX_SLIDER_VAL - contrast);
    };

    /**
     * Scales the slider value to the corresponding cornerstone tools values
     * for brightness.
     *
     * @param {number} brightness - between 0 and 100 value from slider
     * @param {Object} viewport
     */
    const updateViewportBrightness = (brightness, viewport) => {
        // convert from slider scale to cornerstone scale
        viewport.voi.windowCenter =
            (MAX_BRIGHTNESS / MAX_SLIDER_VAL) * (MAX_SLIDER_VAL - brightness);
    };

    const toggleBrightnessSliderVisibility = () => {
        setSliderVisibility({
            brightnessSlider: !sliderVisibility.brightnessSlider,
            contrastSlider: false,
        });
    };

    const toggleContrastSliderVisibility = () => {
        setSliderVisibility({
            brightnessSlider: false,
            contrastSlider: !sliderVisibility.contrastSlider,
        });
    };

    const toggleInvert = () => {
        setInverted(!isInverted);
        setSliderVisibility({
            brightnessSlider: false,
            contrastSlider: false,
        });

        const imageElement = document.getElementById('imageContainer');
        if (imageElement !== null) {
            const viewportTop = cornerstone.getViewport(imageElement);
            viewportTop.invert = !viewportTop.invert;
            cornerstone.setViewport(imageElement, viewportTop);
        }
    };

    const handleClose = () => {
        setSliderVisibility({
            brightnessSlider: false,
            contrastSlider: false,
        });
        dispatch(updateIsImageToolsOpen(false));
    };

    /**
     * Gets FAB info to determine the show/hide and FAB opacity
     *
     * @returns {{$fabOpacity: boolean, $show: boolean}}
     */
    const getFABInfo = () => {
        if (
            cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
            cornerstoneMode === constants.cornerstoneMode.EDITION ||
            isVisible
        ) {
            return { $fabOpacity: false, $show: true };
        } else {
            return { $fabOpacity: isVisible, $show: isVisible };
        }
    };

    if (currentFile !== null) {
        return (
            <SpeedDialWrapper
                onMouseLeave={handleClose}
                $isSideMenuCollapsed={isSideMenuVisible}>
                <SliderGroup
                    $show={
                        sliderVisibility.contrastSlider ||
                        sliderVisibility.brightnessSlider
                    }>
                    <SliderWrapper $show={sliderVisibility.brightnessSlider}>
                        <StyledSlider
                            aria-label={'Brightness'}
                            valueLabelDisplay="auto"
                            defaultValue={50}
                            value={brightness}
                            onChange={handleBrightnessChange}
                        />
                    </SliderWrapper>
                    <SliderWrapper $show={sliderVisibility.contrastSlider}>
                        <StyledSlider
                            aria-label={'Contrast'}
                            valueLabelDisplay="auto"
                            defaultValue={50}
                            value={contrast}
                            onChange={handleContrastChange}
                        />
                    </SliderWrapper>
                </SliderGroup>
                <StyledSpeedDial
                    {...getFABInfo()}
                    $invert={isInverted}
                    $isOpen={isOpen}
                    ariaLabel={'Speed Dial Button'}
                    open={isOpen}
                    icon={
                        <>
                            <StyledTooltip
                                $show={!isOpen}
                                placement={'left'}
                                title={isOpen ? '' : 'Image Tools'}>
                                <SpeedDialIconWrapper
                                    onClick={() => {
                                        dispatch(updateIsImageToolsOpen(true));
                                    }}
                                    $show={!isOpen}>
                                    <ScaleIcon
                                        width={'24px'}
                                        height={'24px'}
                                        color={'white'}
                                    />
                                </SpeedDialIconWrapper>
                            </StyledTooltip>
                            <StyledTooltip
                                $show={isOpen}
                                placement={'left'}
                                title={isOpen ? 'Invert' : ''}>
                                <SpeedDialIconWrapper
                                    onClick={toggleInvert}
                                    $show={isOpen}>
                                    <InvertIcon
                                        width={'24px'}
                                        height={'24px'}
                                        color={'white'}
                                    />
                                </SpeedDialIconWrapper>
                            </StyledTooltip>
                        </>
                    }>
                    <StyledAction
                        key={'contrast'}
                        icon={
                            <ContrastIcon
                                width={'24px'}
                                height={'24px'}
                                color={'white'}
                            />
                        }
                        tooltipTitle={'Contrast'}
                        placement={'left-start'}
                        onClick={toggleContrastSliderVisibility}
                        $active={sliderVisibility.contrastSlider}
                    />
                    <StyledAction
                        key={'brightness'}
                        icon={
                            <BrightnessIcon
                                width={'24px'}
                                height={'24px'}
                                color={'white'}
                            />
                        }
                        tooltipTitle={'Brightness'}
                        placement={'left-start'}
                        onClick={toggleBrightnessSliderVisibility}
                        $active={sliderVisibility.brightnessSlider}
                    />
                </StyledSpeedDial>
            </SpeedDialWrapper>
        );
    } else return null;
};

export default ImageToolsFab;
