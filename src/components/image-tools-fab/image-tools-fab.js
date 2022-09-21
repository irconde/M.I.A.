import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    SpeedDialIconWrapper,
    SpeedDialWrapper,
    StyledAction,
    StyledSpeedDial,
    StyledTooltip,
} from './image-tools-fab.styles';
import { useDispatch, useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getCornerstoneMode,
    getIsFabVisible,
    getIsImageToolsOpen,
    getSettingsVisibility,
    getSingleViewport,
    toggleImageToolsOpen,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/enums/Constants';
import ScaleIcon from '../../icons/image-tools-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/image-tools-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/image-tools-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/image-tools-fab/brightness-icon/brightness.icon';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';

const ImageToolsFab = (props) => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const currentFile = useSelector(getCurrentFile);
    const isSideMenuCollapsed = useSelector(getCollapsedSideMenu);
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const singleViewport = useSelector(getSingleViewport);
    const dispatch = useDispatch();
    const [isInverted, setInverted] = useState(false);

    const toggleInvert = () => {
        setInverted(!isInverted);
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
            (settingsVisibility && isVisible)
        ) {
            return { $fabOpacity: false, $show: true };
        } else {
            return { $fabOpacity: isVisible, $show: isVisible };
        }
    };

    if (currentFile !== null) {
        return (
            <SpeedDialWrapper $isSideMenuCollapsed={isSideMenuCollapsed}>
                <StyledSpeedDial
                    {...getFABInfo()}
                    $invert={isInverted}
                    $isOpen={isOpen}
                    ariaLabel={'Speed Dial Button'}
                    open={isOpen}
                    onMouseLeave={() => dispatch(toggleImageToolsOpen(false))}
                    icon={
                        <>
                            <StyledTooltip
                                $show={!isOpen}
                                placement={'left'}
                                title={isOpen ? '' : 'Image Tools'}>
                                <SpeedDialIconWrapper
                                    onClick={() => {
                                        dispatch(toggleImageToolsOpen(true));
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
            </SpeedDialWrapper>
        );
    } else return null;
};

ImageToolsFab.propTypes = {
    cornerstone: PropTypes.object.isRequired,
    imageViewportTop: PropTypes.object.isRequired,
    imageViewportSide: PropTypes.object.isRequired,
};

export default ImageToolsFab;
