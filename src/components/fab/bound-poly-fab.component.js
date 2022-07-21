import React from 'react';
import PropTypes from 'prop-types';
import * as constants from '../../utils/Constants';
import { useSelector } from 'react-redux';
import {
    getCollapsedLazyMenu,
    getCollapsedSideMenu,
    getCornerstoneMode,
    getIsFabVisible,
} from '../../redux/slices/ui/uiSlice';
import {
    getDeviceType,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import isElectron from 'is-electron';
import Tooltip from '@mui/material/Tooltip';
import {
    FABContainer,
    FABdivider,
    FabIconWrapper,
    FABoption,
} from './bound-poly-fab.styles';
import RectangleIcon from '../../icons/shared/rectangle-icon/rectangle.icon';
import PolygonIcon from '../../icons/shared/polygon-icon/polygon.icon';

/**
 * Styled div for the FAB Button. Takes in props to control the look depending on certain properties.
 *
 * @property {leftPX} - Prop to control the horizontal alignment dynamically
 * @property {fabOpacity} - Prop to control opacity based on the current cornerstoneMode
 * @property {show} - Prop to control whether the component should be displayed
 */

/**
 * Component for user to create a new detection and its polygon mask.
 *
 * @component
 *
 *
 */
const BoundPolyFABComponent = ({ onBoundingSelect, onPolygonSelect }) => {
    const isVisible = useSelector(getIsFabVisible);
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const sideMenuCollapsed = useSelector(getCollapsedSideMenu);
    const lazyMenuCollapsed = useSelector(getCollapsedLazyMenu);
    const localFileOutput = useSelector(getLocalFileOutput);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const desktopMode =
        isElectron() && !remoteOrLocal && localFileOutput !== '';
    const deviceType = useSelector(getDeviceType);
    const handleClick = (e, cb) => {
        if (
            isVisible &&
            cornerstoneMode === constants.cornerstoneMode.SELECTION
        ) {
            cb(e);
        }
    };
    // Calculating screen size and setting horizontal value accordingly.
    //let leftPX = sideMenuCollapsed ? '0' : '-' + constants.sideMenuWidth + 'px';
    let leftPX;
    if (desktopMode) {
        if (lazyMenuCollapsed && sideMenuCollapsed) {
            leftPX = 0;
        } else if (!lazyMenuCollapsed && sideMenuCollapsed) {
            leftPX = `${constants.sideMenuWidth}px`;
        } else if (lazyMenuCollapsed && !sideMenuCollapsed) {
            leftPX = `-${constants.sideMenuWidth}px`;
        } else {
            leftPX = 0;
        }
    } else {
        leftPX = sideMenuCollapsed ? '0' : '-' + constants.sideMenuWidth + 'px';
    }
    let fabOpacity;
    let show;
    if (
        cornerstoneMode === constants.cornerstoneMode.ANNOTATION ||
        cornerstoneMode === constants.cornerstoneMode.EDITION
    ) {
        fabOpacity = false;
        show = true;
        if (cornerstoneMode === constants.cornerstoneMode.ANNOTATION) {
            // TODO: Future refactoring
            let canvasElements =
                document.getElementsByClassName('cornerstone-canvas');
            let multipleViewports = canvasElements.length > 1;
            if (canvasElements[0] !== undefined)
                canvasElements[0].id = 'selectedTop';
            if (multipleViewports) canvasElements[1].id = 'selectedSide';
        }
    } else if (isVisible === false) {
        show = false;
    } else {
        fabOpacity = true;
        show = true;
        // TODO: Future refactoring
        let canvasElements =
            document.getElementsByClassName('cornerstone-canvas');
        let multipleViewports = canvasElements.length > 1;
        canvasElements[0].id = '';
        if (multipleViewports) canvasElements[1].id = '';
    }

    return (
        <FABContainer
            leftPX={leftPX}
            fabOpacity={fabOpacity}
            show={show}
            deviceType={deviceType}>
            <Tooltip title="Create box annotation" placement="bottom">
                <FABoption onClick={(e) => handleClick(e, onBoundingSelect)}>
                    <FabIconWrapper>
                        <RectangleIcon
                            width={'31px'}
                            height={'31px'}
                            color={'#464646'}
                            borderColor={'grey'}
                        />
                    </FabIconWrapper>
                    <span>Bounding box</span>
                </FABoption>
            </Tooltip>
            <FABdivider />
            <Tooltip title="Create mask annotation" placement="bottom">
                <FABoption
                    onClick={(e) => {
                        handleClick(e, onPolygonSelect);
                    }}>
                    <FabIconWrapper>
                        <PolygonIcon
                            width={'31px'}
                            height={'31px'}
                            color={'#464646'}
                            borderColor={'grey'}
                        />
                    </FabIconWrapper>
                    <span>Polygon mask</span>
                </FABoption>
            </Tooltip>
        </FABContainer>
    );
};

BoundPolyFABComponent.propTypes = {
    /**
     * Callback for bounding box selection
     */
    onBoundingSelect: PropTypes.func.isRequired,
    /**
     * Callback for polygon mask selection
     */
    onPolygonSelect: PropTypes.func.isRequired,
};

export default BoundPolyFABComponent;
