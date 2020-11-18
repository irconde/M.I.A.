import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MetaData from '../Snackbars/MetaData';
import TreeDetection from './TreeDetection';
import * as Icons from './Icons';
import * as constants from '../../Constants';
import { Spring } from 'react-spring/renderprops';

class TreeAlgorithm extends Component {
    constructor(props){
        super(props);
        this.state = {
            arrowStyle: {
                height: '1.5rem',
                width: '1.5rem',
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '0.5rem',
            },
            typeStyles: {
                fontSize: 14,
                verticalAlign: 'super',
                fontFamily: 'Noto Sans JP Medium',
                display: 'inline-block',
                margin: 'auto'
            },
            containerStyle: {
                height: '2.375rem',
                paddingBottom: '0.15rem'
            },
            isVisible: true,
            isEnabled: true,
            isSelected: false
        }
        this.setVisibility = this.setVisibility.bind(this);
        this.setEnabled = this.setEnabled.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }
    static propTypes = {
        algorithm: PropTypes.object.isRequired
    }

    setVisibility(){
        this.setState({isVisible: !this.state.isVisible});
    }

    setEnabled(){
        this.setState({isEnabled: !this.state.isEnabled});
    }

    setSelected(){
        this.setState({ isSelected: !this.state.isSelected });
    }

    render() {
        // console.log(this.props.algorithm);
        return (
            <div>
                <div style={this.state.isSelected ? {
                        ...this.state.containerStyle,
                        backgroundColor: '#367EFF'
                    } : this.state.containerStyle}>
                    <svg style={this.state.arrowStyle} onClick={this.setVisibility} transform="rotate(90)" viewBox="0 0 24 24">
                        <g id="ic_menu_arrow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="arrow_right-24px-copy">
                                <polygon id="Path" fill="#FFFFFF" fillRule="nonzero" points="10 17 15 12 10 7"></polygon>
                                <polygon id="Path" points="0 24 0 0 24 0 24 24"></polygon>
                            </g>
                        </g>
                    </svg>
                    <div onClick={this.setSelected} style={this.state.typeStyles}>Algorithm - {this.props.algorithm.algorithm}</div>
                    {this.state.isEnabled ? <Icons.EyeO onClick={this.setEnabled} style={this.state.eyeStyle} /> : <Icons.EyeC onClick={this.setEnabled} style={this.state.eyeStyle} />}
                </div>                
                <div id='detection-holder'>
                    {this.props.algorithm.data.top !== undefined && this.state.isVisible===true ? 
                        this.props.algorithm.data.top.map((value, index) => {
                            // Deciding what color to display next to the detection
                            let detectionColor = null;
                            if (value.selected === true){
                                detectionColor = constants.detectionStyle.SELECTED_COLOR;
                            } else {
                                if (value.validation === undefined) {
                                    detectionColor = constants.detectionStyle.NORMAL_COLOR;
                                } else if (value.validation === false) {
                                    detectionColor = constants.detectionStyle.INVALID_COLOR;
                                } else if (value.validation === true) {
                                    detectionColor = constants.detectionStyle.VALID_COLOR;
                                }
                            }
                            return (
                                <TreeDetection detection={value} selected={this.state.isSelected} enabled={this.state.isEnabled} detectionColor={detectionColor} key={index} />
                            )
                        })
                        : 
                        // If no data
                        <span></span>
                    }
                    {/* Repeating the process for the side stack if it exists */}
                    {this.props.algorithm.data.side !== undefined && this.state.isVisible===true ? 
                        this.props.algorithm.data.side.map((value, index) => {
                            // Deciding what color to display next to the detection
                            let detectionColor = null;
                            if (value.selected === true){
                                detectionColor = constants.detectionStyle.SELECTED_COLOR;
                            } else {
                                if (value.validation === undefined) {
                                    detectionColor = constants.detectionStyle.NORMAL_COLOR;
                                } else if (value.validation === false) {
                                    detectionColor = constants.detectionStyle.INVALID_COLOR;
                                } else if (value.validation === true) {
                                    detectionColor = constants.detectionStyle.VALID_COLOR;
                                }
                            }
                            return (
                                <TreeDetection detection={value} selected={this.state.isSelected} enabled={this.state.isEnabled} detectionColor={detectionColor} key={index} />
                            )
                        })
                        : 
                        // No data
                        <span></span>
                    }
                </div>
            </div>
        );
    }
}

export default TreeAlgorithm;