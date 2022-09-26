import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getIsFabVisible,
    getIsImageToolsOpen,
} from '../../../redux/slices-old/ui/uiSlice';
import { getDetectionChanged } from '../../../redux/slices-old/detections/detectionsSlice';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import { SaveButtonFab, SaveButtonText } from './save-button.styles';
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
    const isBoundPolyVisible = useSelector(getIsFabVisible);

    if (collapseBtn)
        return (
            <Tooltip
                disableHoverListener={isImageToolsOpen || !detectionChanged}
                title={'Save Image'}>
                <CollapsedButtonContainer
                    $isFaded={isImageToolsOpen || !detectionChanged}
                    isCollapsed={isCollapsed}>
                    <SaveButtonFab
                        onClick={nextImageClick}
                        $enabled={detectionChanged}
                        disabled={!isBoundPolyVisible}
                        color="primary">
                        <SaveArrowIcon
                            width="24px"
                            height="24px"
                            color="white"
                        />
                    </SaveButtonFab>
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
