import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getIsImageToolsOpen,
} from '../../../redux/slices/ui/uiSlice';
import { getDetectionChanged } from '../../../redux/slices/detections/detectionsSlice';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';
import { Fab } from '@mui/material';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import { SaveButtonText } from './save-button.styles';
import Tooltip from '@mui/material/Tooltip';

/**
 * Component button that allows user to save edited detections and load next files in queue. Similar to NextButtonComponent compnent but for local files only.
 *
 * @component
 *
 *
 */

const SaveButtonComponent = ({ nextImageClick, collapseBtn = false }) => {
    const isCollapsed = useSelector(getCollapsedSideMenu);
    const isImageToolsOpen = useSelector(getIsImageToolsOpen);
    const detectionChanged = useSelector(getDetectionChanged);

    console.log('Detection Changed: ', detectionChanged);

    if (collapseBtn)
        return (
            <Tooltip
                disableHoverListener={!detectionChanged}
                title={'Save Image'}>
                <CollapsedButtonContainer
                    $isFaded={isImageToolsOpen || !detectionChanged}
                    isCollapsed={isCollapsed}>
                    <Fab onClick={nextImageClick} color="primary">
                        <SaveArrowIcon
                            width="24px"
                            height="24px"
                            color="white"
                        />
                    </Fab>
                </CollapsedButtonContainer>
            </Tooltip>
        );
    else
        return (
            <Tooltip title={'Save Image'}>
                <SideMenuButtonContainer
                    $isFaded={isImageToolsOpen || !detectionChanged}
                    enabled={detectionChanged}
                    onClick={nextImageClick}
                    id="SaveButtonComponent">
                    <SaveArrowIcon width="24px" height="24px" color="white" />
                    <SaveButtonText>Save File</SaveButtonText>
                </SideMenuButtonContainer>
            </Tooltip>
        );
};

SaveButtonComponent.propTypes = {
    /**
     * Callback for loading next image
     */
    nextImageClick: PropTypes.func.isRequired,
    /**
     * Boolean value determining if side menu component is collapsed or not.
     */
    collapseBtn: PropTypes.bool,
};

export default SaveButtonComponent;
