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
import {
    getHasAllAnnotationsDeleted,
    getImageBrightness,
    getImageContrast,
    getImageInversion,
    getMaxImageValues,
    updateImageBrightness,
    updateImageContrast,
    updateImageInversion,
} from '../../redux/slices/annotation.slice';

const ImageToolsFabComponent = () => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const currentFile = useSelector(getCurrFileName);
    const isSideMenuVisible = useSelector(getSideMenuVisible);
    const hasAllAnnotationsDeleted = useSelector(getHasAllAnnotationsDeleted);
    const isVisible = useSelector(getIsFABVisible);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const maxImageValues = useSelector(getMaxImageValues);
    const { maxBrightness, maxContrast } = maxImageValues;
    const dispatch = useDispatch();
    const isInverted = useSelector(getImageInversion);
    const [sliderVisibility, setSliderVisibility] = useState({
        brightnessSlider: false,
        contrastSlider: false,
    });
    const brightness = useSelector(getImageBrightness);
    const contrast = useSelector(getImageContrast);

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
            dispatch(updateImageContrast(value));
            const enabledElement = cornerstone.getEnabledElement(imageElement);
            updateViewportContrast(value, enabledElement.viewport);
            cornerstone.setViewport(imageElement, enabledElement.viewport);
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
        const imageElement = document.getElementById('imageContainer');
        if (imageElement !== null) {
            dispatch(updateImageBrightness(value));
            const enabledElement = cornerstone.getEnabledElement(imageElement);
            updateViewportBrightness(value, enabledElement.viewport);
            cornerstone.setViewport(imageElement, enabledElement.viewport);
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
        viewport.voi.windowWidth = maxContrast - (contrast / 100) * maxContrast;
    };

    /**
     * Scales the slider value to the corresponding cornerstone tools values
     * for brightness.
     *
     * @param {number} brightness - between 0 and 100 value from slider
     * @param {Object} viewport
     */
    const updateViewportBrightness = (brightness, viewport) => {
        viewport.voi.windowCenter =
            maxBrightness - (brightness / 100) * maxBrightness;
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
        dispatch(updateImageInversion(!isInverted));
        setSliderVisibility({
            brightnessSlider: false,
            contrastSlider: false,
        });

        const imageElement = document.getElementById('imageContainer');
        if (imageElement !== null) {
            const enabledElement = cornerstone.getEnabledElement(imageElement);
            enabledElement.viewport.invert = !enabledElement.viewport.invert;
            cornerstone.setViewport(imageElement, enabledElement.viewport);
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
                $isSideMenuCollapsed={
                    (!isSideMenuVisible || hasAllAnnotationsDeleted) &&
                    currentFile !== ''
                }>
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
                        placement={'left'}
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
                        placement={'left'}
                        onClick={toggleBrightnessSliderVisibility}
                        $active={sliderVisibility.brightnessSlider}
                    />
                </StyledSpeedDial>
            </SpeedDialWrapper>
        );
    } else return null;
};

export default ImageToolsFabComponent;
