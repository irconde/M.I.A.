import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { MAX_LABEL_LENGTH } from '../../utils/Constants';
import Utils from '../../utils/Utils.js';
import { useDispatch } from 'react-redux';
import {
    clearAllSelection,
    selectDetection,
    updateDetectionVisibility,
} from '../../redux/slices/detections/detectionsSlice';
import {
    detectionSelectedUpdate,
    hideContextMenuUpdate,
} from '../../redux/slices/ui/uiSlice';
import { detectionStyle } from '../../utils/Constants';

const SideMenuDetection = ({
    detection,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const dispatch = useDispatch();
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
        height: '1.5rem',
        width: '1.5rem',
        display: 'inline-block',
        float: 'right',
        marginRight: '1.0rem',
        marginBottom: '0.25rem',
    };

    /**
     * setVisible - Is how we control the eye visibility for each detection.
     *
     *
     * @param {type} none
     * @returns {type} none
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
     * setSelected() - Simply tells the redux store to update the selected detection
     *
     * @param {type} none
     * @returns {type} none
     */
    const setSelected = (e) => {
        if (e.target.id !== 'Shape' && e.target.id !== 'eye') {
            dispatch(selectDetection(detection.uuid));
            dispatch(detectionSelectedUpdate());
            resetCornerstoneTools();
            renderDetectionContextMenu(e, undefined, detection);
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
    detection: PropTypes.object.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenuDetection;
