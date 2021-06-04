import React from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle, MAX_LABEL_LENGTH } from '../../Constants';
import Utils from '../../Utils.js';
import { useDispatch } from 'react-redux';
import {
    getDetectionColor,
    selectDetection,
    updateDetectionVisibility,
} from '../../redux/slices/detections/detectionsSlice';
import {
    menuDetectionSelectedUpdate,
    resetSelectedDetectionBoxesUpdate,
} from '../../redux/slices/ui/uiSlice';

const SideMenuDetection = ({
    detection,
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
            dispatch(selectDetection(detection.uuid));
            dispatch(menuDetectionSelectedUpdate());
            resetCornerstoneTools();
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
                              backgroundColor: detection.displayColor,
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
    algorithmSelected: PropTypes.string.isRequired,
    resetSelectedDetectionBoxes: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenuDetection;
