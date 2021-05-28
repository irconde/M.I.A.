import React from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle, MAX_LABEL_LENGTH } from '../../Constants';
import Utils from '../../Utils.js';
import { useDispatch } from 'react-redux';
import {
    getDetectionColor,
    menuSelectDetection,
    updateDetectionVisibility,
} from '../../redux/slices/detections/detectionsSlice';

const SideMenuDetection = ({
    detection,
    algorithmVisible,
    algorithmSelected,
    resetSelectedDetectionBoxes,
    resetCornerstoneTools,
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
            resetSelectedDetectionBoxes(e, true);
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
            dispatch(menuSelectDetection(detection.uuid));
            resetCornerstoneTools();
        }
    };

    // Figuring out what text color we need to display on the detection
    let textColor = 'white';
    let selectionColor;
    let colorSelection = false;
    if (detection.validation === true && detection.validation !== undefined) {
        textColor = detectionStyle.VALID_COLOR;
    } else if (
        detection.validation === false &&
        detection.validation !== undefined
    ) {
        textColor = detectionStyle.INVALID_COLOR;
    } else if (!detection.visible) {
        textColor = 'gray';
    }
    if (detection.selected) {
        selectionColor = detectionStyle.SELECTED_COLOR;
        colorSelection = true;
    }
    const detectionColor = getDetectionColor(detection);
    if (algorithmSelected === detection.algorithm) {
        selectionColor = 'rgba(54, 127, 255, 0.2)';
        colorSelection = true;
    }
    // We only display an open eye if both algorithm and detection are visible.
    if (detection.visible === true) {
        return (
            <div
                id={`${detection.view}-container`}
                onClick={setSelected}
                style={
                    colorSelection
                        ? {
                              ...containerStyle,
                              backgroundColor: selectionColor,
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
                        color: textColor,
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
                        backgroundColor: detectionColor,
                    }}></div>
                <span
                    id={`${detection.view}-hidden-span`}
                    style={{
                        ...typeStyle,
                        color: textColor,
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
    algorithmVisible: PropTypes.bool.isRequired,
    algorithmSelected: PropTypes.string.isRequired,
    resetSelectedDetectionBoxes: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenuDetection;
