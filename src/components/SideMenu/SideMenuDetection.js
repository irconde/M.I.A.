import React from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle, MAX_LABEL_LENGTH } from '../../utils/Constants';
import Utils from '../../utils/Utils.js';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearAllSelection,
    getSelectedAlgorithm,
    selectDetection,
    updateDetectionVisibility,
} from '../../redux/slices/detections/detectionsSlice';
import {
    detectionSelectedUpdate,
    hideContextMenuUpdate,
} from '../../redux/slices/ui/uiSlice';

/**
 * Helper component for SideMenuAlgorithm component that allows user to display tree view of detections
 *
 * @component
 *
 * @param {Array<Detection>} detections Array of detection objects
 * @param {function} resetCornerstoneTools Callback to reset cornerstone tools to initial values
 * @param {function} renderDetectionContextMenu Callback to render specific detection context menus
 *
 *
 */

const SideMenuDetection = ({
    detection,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const dispatch = useDispatch();
    const selectedAlgorithm = useSelector(getSelectedAlgorithm);
    const detectionBGStyle = {
        width: '0.75rem',
        height: '0.75rem',
        display: 'inline-block',
        border: '0.0625rem solid rgba(220,220,220,0.4)',
        marginLeft: '2.4rem',
        marginRight: '0.75rem',
        verticalAlign: 'middle',
        marginTop: '-0.2rem',
    };
    const typeStyle = {
        textTransform: 'uppercase',
        fontFamily: 'Noto Sans JP',
        cursor: 'default',
    };
    const containerStyle = {
        paddingTop: '0.45rem',
        paddingBottom: '0.45rem',
    };
    const eyeStyle = {
        height: '20px',
        width: '20px',
        display: 'inline-block',
        float: 'right',
        marginRight: '1.0rem',
        marginBottom: '0.25rem',
    };

    /**
     * Sets each detection's eye-like icon visibility
     */
    const setVisible = (e) => {
        if (
            e.target.id === 'Shape' ||
            e.target.id === 'eye' ||
            e.target.id === 'hidden-eye'
        ) {
            dispatch(updateDetectionVisibility(detection.uuid));
            if (detection.selected === true) {
                dispatch(hideContextMenuUpdate());
                dispatch(clearAllSelection());
            }
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
                renderDetectionContextMenu(e, undefined, detection);
            } else {
                dispatch(hideContextMenuUpdate());
                dispatch(clearAllSelection());
            }
        }
    };
    // We only display an open eye if both algorithm and detection are visible.
    if (detection.visible === true) {
        return (
            <div
                id={`${detection.view}-container`}
                onClick={setSelected}
                style={
                    detection.selected
                        ? {
                              ...containerStyle,
                              backgroundColor: detectionStyle.SELECTED_COLOR,
                          }
                        : containerStyle
                }>
                <div
                    id="detectionBG"
                    style={{
                        ...detectionBGStyle,
                        backgroundColor: detection.color,
                    }}></div>
                <span
                    id={`${detection.view}-span`}
                    style={{
                        ...typeStyle,
                        color: detection.textColor,
                    }}>{`${Utils.truncateString(
                    detection.className,
                    MAX_LABEL_LENGTH
                )} - ${detection.confidence}%`}</span>
                <Icons.EyeO id="eye" onClick={setVisible} style={eyeStyle} />
            </div>
        );
    } else {
        return (
            <div
                id={`${detection.view}-hidden-container`}
                style={containerStyle}>
                <div
                    style={{
                        ...detectionBGStyle,
                        backgroundColor: detection.displayColor,
                    }}></div>
                <span
                    id={`${detection.view}-hidden-span`}
                    style={{
                        ...typeStyle,
                        color: detection.textColor,
                    }}>{`${Utils.truncateString(
                    detection.className,
                    MAX_LABEL_LENGTH
                )} - ${detection.confidence}%`}</span>
                <Icons.EyeC
                    id="hidden-eye"
                    onClick={setVisible}
                    style={eyeStyle}
                />
            </div>
        );
    }
};

SideMenuDetection.propTypes = {
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

export default SideMenuDetection;
