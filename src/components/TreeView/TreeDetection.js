import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle } from '../../Constants';

class TreeDetection extends Component {
    constructor(props){
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
                marginTop: '-0.2rem'
            },
            typeStyle: {
                textTransform: 'uppercase',
                fontFamily: 'Noto Sans JP Regular',
                cursor: 'default'
            },
            containerStyle: {
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem'
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '1.0rem',
                marginBottom: '0.25rem'
            },
            isEnabled: true
        }
        this.setEnabled = this.setEnabled.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }
    static propTypes = {
        detection: PropTypes.object.isRequired,
        detectionColor: PropTypes.string,
        enabled: PropTypes.bool.isRequired,
        selected: PropTypes.bool.isRequired,
        updateEnabled: PropTypes.func.isRequired,
        updateSelectedDetection: PropTypes.func.isRequired,
        detectionIndex: PropTypes.number.isRequired,
        algorithmSelected: PropTypes.bool.isRequired
    }

    /**
     * setEnabled - Is how we control the eye visibility for each detection.
     *              We use a variable called isChanging, to control the eye
     *              in the TreeAlgorithm Component.
     *
     * @param {type} none
     * @returns {type} none
     */
    setEnabled(){
        this.props.detection.visible = !this.props.detection.visible;
        if (this.props.enabled === false && this.state.isEnabled === true) {
            this.props.updateEnabled();
            return;
        }
        this.setState({ isEnabled: !this.state.isEnabled }, () => {
            if (this.props.enabled === false && (this.state.isEnabled === true || this.state.isEnabled === false) ) {
                this.props.updateEnabled();
            }
        });

    }

    /**
     * setSelected() - Simply tells our controller to update the selected detection
     *
     * @param {type} none
     * @returns {type} none
     */
    setSelected() {
        this.props.updateSelectedDetection(this.props.detectionIndex);
        this.props.detection.selected = !this.props.detection.selected;
    }

    render() {
        
        // Figuring out what text color we need to display on the detection
        let textColor = 'white';
        let selectionColor;
        let colorSelection = false;
        if (this.props.detection.validation === true && this.props.detection.validation !== undefined){
            textColor = detectionStyle.VALID_COLOR;
        } else if (this.props.detection.validation === false && this.props.detection.validation !== undefined){
            textColor = detectionStyle.INVALID_COLOR;
        } else if (!this.props.enabled || !this.state.isEnabled){
            textColor = 'gray';
        }
        if (this.props.selected === true || this.props.detection.selected) {
            selectionColor = 'rgba(54, 126, 255, 1)';
            colorSelection = true;
        }
        if (this.props.algorithmSelected) {
            selectionColor = 'rgba(54, 126, 255, 0.2)';
            colorSelection = true;
        }
        // We only display an open eye if both algorithm and detection are enabled.
        if (this.props.enabled === true && this.state.isEnabled === true) {
            return (
                <div onClick={this.setSelected} style={colorSelection ?
                    {...this.state.containerStyle,
                    backgroundColor: selectionColor,}
                    :
                    this.state.containerStyle}>
                    <div style={{
                        ...this.state.detectionBGStyle,
                        backgroundColor: this.props.detectionColor === "black" ? this.props.detection.color : this.props.detectionColor,
                    }}></div>
                    <span style={{
                        ...this.state.typeStyle,
                        color: textColor
                    }}>{`${this.props.detection.class} - ${this.props.detection.confidence}%`}</span>
                    <Icons.EyeO onClick={this.setEnabled} style={this.state.eyeStyle} />
                </div>
            );
        } else {
            return (
                <div style={this.state.containerStyle}>
                    <div style={{
                        ...this.state.detectionBGStyle,
                        backgroundColor: this.props.detectionColor,
                    }}></div>
                    <span style={{
                        ...this.state.typeStyle,
                        color: textColor
                    }}>{`${this.props.detection.class} - ${this.props.detection.confidence}%`}</span>
                    <Icons.EyeC onClick={this.setEnabled} style={this.state.eyeStyle} />
                </div>
            );
        }
    }
}

export default TreeDetection;
