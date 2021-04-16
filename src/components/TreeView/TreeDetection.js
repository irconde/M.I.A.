import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle, MAX_LABEL_LENGTH } from '../../Constants';
import Utils from '../../Utils.js';

class TreeDetection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detectionBGStyle: {
                width: '0.75rem',
                height: '0.75rem',
                display: 'inline-block',
                border: '0.0625rem solid rgba(220,220,220,0.4)',
                marginLeft: '2.4rem',
                marginRight: '0.75rem',
                verticalAlign: 'middle',
                marginTop: '-0.2rem',
            },
            typeStyle: {
                textTransform: 'uppercase',
                fontFamily: 'Noto Sans JP',
                cursor: 'default',
            },
            containerStyle: {
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '1.0rem',
                marginBottom: '0.25rem',
            },
        };
        this.setVisible = this.setVisible.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }
    static propTypes = {
        detection: PropTypes.object.isRequired,
        detectionColor: PropTypes.string,
        visible: PropTypes.bool.isRequired,
        updateImage: PropTypes.func.isRequired,
        updateSelectedDetection: PropTypes.func.isRequired,
        resetSelectedDetectionBoxes: PropTypes.func.isRequired,
        algorithmSelected: PropTypes.bool.isRequired,
        algorithmVisible: PropTypes.bool.isRequired,
        updateAlgorithmVisibility: PropTypes.func.isRequired,
        updateDetectionVisibility: PropTypes.func.isRequired,
    };

    /**
     * setVisible - Is how we control the eye visibility for each detection.
     *
     *
     * @param {type} none
     * @returns {type} none
     */
    setVisible(e) {
        if (
            e.target.id === 'Shape' ||
            e.target.id === 'eye' ||
            e.target.id === 'hidden-eye'
        ) {
            this.props.updateDetectionVisibility(
                this.props.detection,
                !this.props.detection.visible
            );
            if (this.props.detection.visible === false) {
                this.props.resetSelectedDetectionBoxes(e, true);
            } else if (this.props.algorithmVisible === false) {
                this.props.updateAlgorithmVisibility();
            }
            this.props.updateImage();
        }
    }

    /**
     * setSelected() - Simply tells our controller to update the selected detection
     *
     * @param {type} none
     * @returns {type} none
     */
    setSelected(e) {
        if (e.target.id !== 'Shape' && e.target.id !== 'eye') {
            // this.props.detection.selected = !this.props.detection.selected;
            this.props.updateSelectedDetection(this.props.detection, e);
        }
    }

    render() {
        // Figuring out what text color we need to display on the detection
        let textColor = 'white';
        let selectionColor;
        let colorSelection = false;
        if (
            this.props.detection.validation === true &&
            this.props.detection.validation !== undefined
        ) {
            textColor = detectionStyle.VALID_COLOR;
        } else if (
            this.props.detection.validation === false &&
            this.props.detection.validation !== undefined
        ) {
            textColor = detectionStyle.INVALID_COLOR;
        } else if (!this.props.detection.visible) {
            textColor = 'gray';
        }
        if (this.props.detection.selected) {
            selectionColor = 'rgba(54, 126, 255, 1)';
            colorSelection = true;
        }
        if (this.props.algorithmSelected) {
            selectionColor = 'rgba(54, 126, 255, 0.2)';
            colorSelection = true;
        }
        // We only display an open eye if both algorithm and detection are visible.
        if (this.props.detection.visible === true) {
            return (
                <div
                    id={`${this.props.detection.view}-container`}
                    onClick={this.setSelected}
                    style={
                        colorSelection
                            ? {
                                  ...this.state.containerStyle,
                                  backgroundColor: selectionColor,
                              }
                            : this.state.containerStyle
                    }>
                    <div
                        id="detectionBG"
                        style={{
                            ...this.state.detectionBGStyle,
                            backgroundColor:
                                this.props.detectionColor === 'black'
                                    ? this.props.detection.color
                                    : this.props.detectionColor,
                        }}></div>
                    <span
                        id={`${this.props.detection.view}-span`}
                        style={{
                            ...this.state.typeStyle,
                            color: textColor,
                        }}>{`${Utils.truncateString(
                        this.props.detection.class,
                        MAX_LABEL_LENGTH
                    )} - ${this.props.detection.confidence}%`}</span>
                    <Icons.EyeO
                        id="eye"
                        onClick={this.setVisible}
                        style={this.state.eyeStyle}
                    />
                </div>
            );
        } else {
            return (
                <div
                    id={`${this.props.detection.view}-hidden-container`}
                    style={this.state.containerStyle}>
                    <div
                        style={{
                            ...this.state.detectionBGStyle,
                            backgroundColor: this.props.detectionColor,
                        }}></div>
                    <span
                        id={`${this.props.detection.view}-hidden-span`}
                        style={{
                            ...this.state.typeStyle,
                            color: textColor,
                        }}>{`${Utils.truncateString(
                        this.props.detection.class,
                        MAX_LABEL_LENGTH
                    )} - ${this.props.detection.confidence}%`}</span>
                    <Icons.EyeC
                        id="hidden-eye"
                        onClick={this.setVisible}
                        style={this.state.eyeStyle}
                    />
                </div>
            );
        }
    }
}

export default TreeDetection;
