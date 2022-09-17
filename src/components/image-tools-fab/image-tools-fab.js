import React from 'react';
import PropTypes from 'prop-types';
import { StyledAction, StyledSpeedDial } from './image-tools-fab.styles';
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

const ImageToolsFab = (props) => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const isSideMenuCollapsed = useSelector(getCollapsedSideMenu);
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const singleViewport = useSelector(getSingleViewport);
    const isInverted = useSelector(getIsImageInverted);
    const dispatch = useDispatch();
    const handleInvert = () => {
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
        // <ImageToolsWrapper
        //     {...getFABInfo()}
        //     $isSideMenuCollapsed={isSideMenuCollapsed}
        //     onClick={() => dispatch(toggleImageToolsOpen())}>
        //     <Tooltip title={'Image Tools'}>
        //         <ImageToolsButton id={'tools button'}>
        //             <ScaleIcon width={'24px'} height={'24px'} color={'white'} />
        //         </ImageToolsButton>
        //     </Tooltip>
        //
        //     <ToolsWrapper $show={isOpen}>
        //         <Tooltip title={'Invert'} placement={'right'}>
        //             <InvertButton $invert={isInverted} onClick={handleInvert}>
        //                 <InvertIcon
        //                     width={'24px'}
        //                     height={'24px'}
        //                     color={'white'}
        //                 />
        //             </InvertButton>
        //         </Tooltip>
        //     </ToolsWrapper>
        // </ImageToolsWrapper>
        <StyledSpeedDial
            {...getFABInfo()}
            $isSideMenuCollapsed={isSideMenuCollapsed}
            ariaLabel={'Speed Dial Button'}
            onClick={() => dispatch(toggleImageToolsOpen())}
            open={isOpen}
            icon={<ScaleIcon width={'24px'} height={'24px'} color={'white'} />}>
            <StyledAction
                key={'invert'}
                icon={
                    <InvertIcon
                        width={'24px'}
                        height={'24px'}
                        color={'white'}
                    />
                }
                tooltipTitle={'Invert'}
            />
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
        </StyledSpeedDial>
    );
};

// TODO: Revert isInverted from redux
// TODO: Make fab stay open even after clicked
// TODO: Make invert tool replace image tools button when open
// TODO: ^ Possibly restructure elements in dom to accomidate replacement
// TODO: Don't hide tools, make them transition out from behind menu button

ImageToolsFab.propTypes = {
    cornerstone: PropTypes.object.isRequired,
    imageViewportTop: PropTypes.object.isRequired,
    imageViewportSide: PropTypes.object.isRequired,
};

export default ImageToolsFab;
