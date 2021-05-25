import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle, MAX_LABEL_LENGTH } from '../../Constants';
import Utils from '../../Utils.js';

const TreeDetection = ({ detection, updateImage, algorithmVisible }) => {
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
            // // this.props.updateDetectionVisibility(
            // //     this.props.detection,
            // //     !this.props.detection.visible
            // // );
            // if (this.props.detection.visible === false) {
            //     // this.props.resetSelectedDetectionBoxes(e, true);
            // } else if (this.props.algorithmVisible === false) {
            //     this.props.updateAlgorithmVisibility();
            // }
            // this.props.updateImage();
        }
    };

    /**
     * setSelected() - Simply tells our controller to update the selected detection
     *
     * @param {type} none
     * @returns {type} none
     */
    const setSelected = (e) => {
        if (e.target.id !== 'Shape' && e.target.id !== 'eye') {
            // this.props.updateSelectedDetection(this.props.detection, e);
        }
    };

    // Figuring out what text color we need to display on the detection
    // let textColor = 'white';
    // let selectionColor;
    // let colorSelection = false;
    // if (
    //     detection.validation === true &&
    //     detection.validation !== undefined
    // ) {
    //     textColor = detectionStyle.VALID_COLOR;
    // } else if (
    //     detection.validation === false &&
    //     detection.validation !== undefined
    // ) {
    //     textColor = detectionStyle.INVALID_COLOR;
    // } else if (!detection.visible) {
    //     textColor = 'gray';
    // }
    // if (detection.selected) {
    //     selectionColor = 'rgba(54, 126, 255, 1)';
    //     colorSelection = true;
    // }
    // if (algorithmSelected) {
    //     selectionColor = 'rgba(54, 126, 255, 0.2)';
    //     colorSelection = true;
    // }
    // We only display an open eye if both algorithm and detection are visible.
    if (detection.visible === true) {
        return (
            <div
                id={`${detection.view}-container`}
                onClick={this.setSelected}
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
                        ...this.state.detectionBGStyle,
                        backgroundColor:
                            detectionColor === 'black'
                                ? detection.color
                                : detectionColor,
                    }}></div>
                <span
                    id={`${detection.view}-span`}
                    style={{
                        ...typeStyle,
                        color: textColor,
                    }}>{`${Utils.truncateString(
                    detection.class,
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
                        ...this.state.typeStyle,
                        color: textColor,
                    }}>{`${Utils.truncateString(
                    detection.class,
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

TreeDetection.propTypes = {
    detection: PropTypes.object.isRequired,
    updateImage: PropTypes.func.isRequired,
    algorithmVisible: PropTypes.bool.isRequired,
};

export default TreeDetection;
