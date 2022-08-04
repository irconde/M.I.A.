import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getCornerstoneMode,
} from '../../../redux/slices/ui/uiSlice';
import * as constants from '../../../utils/general/Constants';
import { getSelectedDetection } from '../../../redux/slices/detections/detectionsSlice';
import {
    getConnected,
    getNumFilesInQueue,
} from '../../../redux/slices/server/serverSlice';
import { Fab } from '@mui/material';
import { getLocalFileOutput } from '../../../redux/slices/settings/settingsSlice';
import Tooltip from '@mui/material/Tooltip';
import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';
import NextArrowIcon from '../../../icons/side-menu/next-arrow-icon/next-arrow.icon';
import { NextIconWrapper } from './next-button.styles';

/**
 * Component button that allows user to save edited detections and load next files in queue.
 *
 * @component
 *
 *
 */

const NextButtonComponent = ({ nextImageClick, collapseBtn = false }) => {
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const selectedDetection = useSelector(getSelectedDetection);
    const connected = useSelector(getConnected);
    const isCollapsed = useSelector(getCollapsedSideMenu);
    const localFileOutput = useSelector(getLocalFileOutput);
    const numFilesInQueue = useSelector(getNumFilesInQueue);
    const enableNextButton =
        !selectedDetection &&
        cornerstoneMode === constants.cornerstoneMode.SELECTION &&
        (connected === true || (localFileOutput !== '' && numFilesInQueue > 0));
    const handleClick = (e) => {
        if (enableNextButton) {
            nextImageClick(e);
        }
    };

    if (collapseBtn)
        return (
            <Tooltip title="Go to next image">
                <CollapsedButtonContainer isCollapsed={isCollapsed}>
                    <Fab
                        onClick={handleClick}
                        disabled={!enableNextButton}
                        color="primary">
                        {enableNextButton && (
                            <NextArrowIcon
                                height="24px"
                                width="24px"
                                color="white"
                            />
                        )}
                    </Fab>
                </CollapsedButtonContainer>
            </Tooltip>
        );
    else
        return (
            <Tooltip title="Go to next image">
                <SideMenuButtonContainer
                    enabled={enableNextButton}
                    onClick={handleClick}
                    id="NextButtonComponent">
                    <p>Next</p>
                    <NextIconWrapper>
                        <NextArrowIcon
                            height="24px"
                            width="24px"
                            color="white"
                        />
                    </NextIconWrapper>
                </SideMenuButtonContainer>
            </Tooltip>
        );
};

NextButtonComponent.propTypes = {
    /**
     * Callback for loading next image
     */
    nextImageClick: PropTypes.func.isRequired,
    /**
     * Boolean value determining if side menu component is collapsed or not.
     */
    collapseBtn: PropTypes.bool,
};

export default NextButtonComponent;
