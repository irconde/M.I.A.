import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getCollapsedSideMenu } from '../../../redux/slices/ui/uiSlice';
import { getDetectionChanged } from '../../../redux/slices/detections/detectionsSlice';
import SaveIcon from '../../../icons/side-menu/save-icon/save.icon';
import { Fab } from '@mui/material';

import {
    CollapsedButtonContainer,
    SideMenuButtonContainer,
} from './shared/button.styles';

import { SaveButtonText } from './save-button.styles';
/**
 * Component button that allows user to save edited detections and load next files in queue. Similar to NextButtonComponent compnent but for local files only.
 *
 * @component
 *
 *
 */

const SaveButtonComponent = ({ nextImageClick, collapseBtn = false }) => {
    const isCollapsed = useSelector(getCollapsedSideMenu);
    const detectionChanged = useSelector(getDetectionChanged);
    if (collapseBtn)
        return (
            <CollapsedButtonContainer isCollapsed={isCollapsed}>
                <Fab
                    onClick={() => nextImageClick()}
                    disabled={detectionChanged}
                    color="primary">
                    {detectionChanged ? (
                        <></>
                    ) : (
                        <SaveIcon width="24px" height="24px" color="white" />
                    )}
                </Fab>
            </CollapsedButtonContainer>
        );
    else
        return (
            <SideMenuButtonContainer
                enabled={detectionChanged}
                onClick={() => nextImageClick()}
                id="SaveButtonComponent">
                <SaveIcon width="24px" height="24px" color="white" />
                <SaveButtonText>Save File</SaveButtonText>
            </SideMenuButtonContainer>
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
