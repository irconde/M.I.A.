import React from 'react';
import PropTypes from 'prop-types';
import {
    SpeedDialIconWrapper,
    StyledAction,
    StyledSpeedDial,
} from './image-tools-fab.styles';
import { useDispatch, useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getCornerstoneMode,
    getIsFabVisible,
    getIsImageInverted,
    getIsImageToolsOpen,
    getSettingsVisibility,
    getSingleViewport,
    toggleImageInverted,
    toggleImageToolsOpen,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/enums/Constants';
import ScaleIcon from '../../icons/image-tools-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/image-tools-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/image-tools-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/image-tools-fab/brightness-icon/brightness.icon';

const ImageToolsFab = (props) => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const isSideMenuCollapsed = useSelector(getCollapsedSideMenu);
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const singleViewport = useSelector(getSingleViewport);
    const isInverted = useSelector(getIsImageInverted);
    const dispatch = useDispatch();

    const toggleInvert = () => {
        const viewportTop = props.cornerstone.getViewport(
            props.imageViewportTop
        );
        viewportTop.invert = !viewportTop.invert;
        props.cornerstone.setViewport(props.imageViewportTop, viewportTop);
        if (!singleViewport) {
            const viewportSide = props.cornerstone.getViewport(
                props.imageViewportSide
            );
            viewportSide.invert = !viewportSide.invert;
            props.cornerstone.setViewport(
                props.imageViewportSide,
                viewportSide
            );
        }
        dispatch(toggleImageInverted());
    };

    /**
     * Gets FAB info to determine the show/hide and FAB opacity
     *
     * @returns {{fabOpacity: boolean, show: boolean}}
     */
    const getFABInfo = () => {
        if (
            cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
            cornerstoneMode === constants.cornerstoneMode.EDITION ||
            settingsVisibility
        ) {
            return { fabOpacity: false, show: true };
        } else {
            return { fabOpacity: isVisible, show: isVisible };
        }
    };

    return (
        <StyledSpeedDial
            {...getFABInfo()}
            $isSideMenuCollapsed={isSideMenuCollapsed}
            $invert={isInverted}
            $isOpen={isOpen}
            ariaLabel={'Speed Dial Button'}
            open={isOpen}
            onMouseLeave={() => dispatch(toggleImageToolsOpen(false))}
            icon={
                <>
                    <SpeedDialIconWrapper
                        onClick={() => {
                            dispatch(toggleImageToolsOpen(true));
                        }}
                        show={!isOpen}>
                        <ScaleIcon
                            width={'24px'}
                            height={'24px'}
                            color={'white'}
                        />
                    </SpeedDialIconWrapper>
                    <SpeedDialIconWrapper onClick={toggleInvert} show={isOpen}>
                        <InvertIcon
                            width={'24px'}
                            height={'24px'}
                            color={'white'}
                        />
                    </SpeedDialIconWrapper>
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
            />
        </StyledSpeedDial>
    );
};

// TODO: Revert isInverted from redux
// TODO: Fix tooltips for menu/invert

ImageToolsFab.propTypes = {
    cornerstone: PropTypes.object.isRequired,
    imageViewportTop: PropTypes.object.isRequired,
    imageViewportSide: PropTypes.object.isRequired,
};

export default ImageToolsFab;
