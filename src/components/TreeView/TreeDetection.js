import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as Icons from './Icons';
import { detectionStyle } from '../../Constants';

class TreeDetection extends Component {
    isChanging;
    constructor(props){
        super(props);
        this.state = {
            detectionBGStyle: {
                width: '0.75rem',
                height: '0.75rem',
                display: 'inline-block',
                marginBottom: '0.15rem',
                border: '0.0625rem solid rgba(220,220,220,0.4)',
                marginLeft: '2rem',
                marginRight: '0.5rem'
            },
            typeStyle: {
                verticalAlign: 'top',
                textTransform: 'uppercase',
                fontFamily: 'Noto Sans JP Regular',
                cursor: 'default'
            },
            containerStyle: {
                paddingTop: '0.45rem'
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '0.5rem',
                marginBottom: '0.25rem'
            },
            isEnabled: true,
            isSelected: false
        }
        this.isChanging = false;
        this.setEnabled = this.setEnabled.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }
    static propTypes = {
        detection: PropTypes.object.isRequired,
        detectionColor: PropTypes.string,
        enabled: PropTypes.bool.isRequired,
        selected: PropTypes.bool.isRequired,
        updateEnabled: PropTypes.func.isRequired,
        updateSelected: PropTypes.func.isRequired
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
        if (this.props.enabled === false && this.state.isEnabled === true) {
            this.props.updateEnabled();
            return;
        }
        this.setState({ isEnabled: !this.state.isEnabled }, () => {
            if (this.props.enabled === false && (this.state.isEnabled === true || this.state.isEnabled === false) ) {
                this.props.updateEnabled();
                this.isChanging = true;
                
            } else {
                this.isChanging = false;
            }
        });
        
    }

    setSelected() {
        this.setState({ isSelected: !this.state.isSelected });
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
        if (this.props.selected === true && this.state.isSelected === true) {
            selectionColor = 'rgba(54, 126, 255, 0.2)';
            colorSelection = true;
            this.state.isSelected = false;
        } else if (this.props.selected === false && this.state.isSelected === true) {
            selectionColor = 'rgb(54, 126, 255)';
            colorSelection = true;
        } else if (this.props.selected === undefined && this.state.isSelected === true) {
            selectionColor = 'rgb(54, 126, 255)';
            colorSelection = true;
        } else if (this.props.selected === true && this.state.isSelected === false) {
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
                        backgroundColor: this.props.detectionColor,                                                 
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