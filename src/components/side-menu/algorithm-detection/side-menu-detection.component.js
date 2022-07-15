import React from 'react';
import PropTypes from 'prop-types';
import { MAX_LABEL_LENGTH } from '../../../utils/Constants';
import Utils from '../../../utils/Utils.js';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearAllSelection,
    getSelectedAlgorithm,
    selectDetection,
    updateDetectionVisibility,
} from '../../../redux/slices/detections/detectionsSlice';
import {
    detectionSelectedUpdate,
    hideContextMenuUpdate,
} from '../../../redux/slices/ui/uiSlice';
import {
    SideMenuDetection,
    DetectionColorBox,
    SideMenuDetectionText,
} from './side-menu-detection.styles';
import { EyeIconWrapper } from '../side-menu.styles';
import Tooltip from '@mui/material/Tooltip';
import EyeOpenIcon from '../../../icons/side-menu/eye-open-icon/eye-open.icon';
import EyeCloseIcon from '../../../icons/side-menu/eye-close-icon/eye-close.icon';

/**
 * Helper component for SideMenuAlgorithmComponent component that allows user to display tree view of detections
 *
 * @component
 *
 *
 */

const SideMenuDetectionComponent = ({
    detection,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const dispatch = useDispatch();
    const selectedAlgorithm = useSelector(getSelectedAlgorithm);

    /**
     * Sets each detection's eye-like icon visibility
     */
    const setVisible = (e) => {
        dispatch(updateDetectionVisibility(detection.uuid));
        if (detection.selected === true) {
            dispatch(hideContextMenuUpdate());
            dispatch(clearAllSelection());
        }
    };

    /**
     * Asks the redux store to update the selected detection
     */
    const setSelected = (e) => {
        if (e.target.id !== 'Shape' && e.target.id !== 'eye') {
            if (
                detection.selected === false ||
                detection.algorithm === selectedAlgorithm
            ) {
                dispatch(selectDetection(detection.uuid));
                dispatch(detectionSelectedUpdate());
                resetCornerstoneTools();
                renderDetectionContextMenu(e, detection);
            } else {
                dispatch(hideContextMenuUpdate());
                dispatch(clearAllSelection());
            }
        }
    };

    const detectionText = `${Utils.truncateString(
        detection.className,
        MAX_LABEL_LENGTH
    )} - ${detection.confidence}%`;
    // We only display an open eye if both algorithm and detection are visible.
    if (detection.visible === true) {
        return (
            <SideMenuDetection
                id={`${detection.view}-container`}
                onClick={setSelected}
                selected={detection.selected}>
                <DetectionColorBox bgColor={detection.color} />
                <SideMenuDetectionText
                    id={`${detection.view}-span`}
                    color={detection.textColor}>
                    {detectionText}
                </SideMenuDetectionText>

                <Tooltip title="Hide">
                    <EyeIconWrapper onClick={setVisible}>
                        <EyeOpenIcon
                            height="20px"
                            width="20px"
                            color="#494949"
                        />
                    </EyeIconWrapper>
                </Tooltip>
            </SideMenuDetection>
        );
    } else {
        return (
            <SideMenuDetection id={`${detection.view}-hidden-container`}>
                <DetectionColorBox />
                <SideMenuDetectionText
                    id={`${detection.view}-hidden-span`}
                    color={detection.textColor}>
                    {detectionText}
                </SideMenuDetectionText>
                <Tooltip title="Make Visible">
                    <EyeIconWrapper onClick={setVisible}>
                        <EyeCloseIcon
                            height="20px"
                            width="20px"
                            color="#494949"
                        />
                    </EyeIconWrapper>
                </Tooltip>
            </SideMenuDetection>
        );
    }
};

SideMenuDetectionComponent.propTypes = {
    /**
     * Array of detection objects
     */
    detection: PropTypes.object.isRequired,
    /**
     * Callback to reset cornerstone tools to initial values
     */
    resetCornerstoneTools: PropTypes.func.isRequired,
    /**
     * Callback to render specific detection context menus
     */
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenuDetectionComponent;
