import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MetaData from '../Snackbars/MetaData';
import TreeDetection from './TreeDetection';
import * as Icons from './Icons';
import * as constants from '../../Constants';

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
                paddingBottom: '0.15rem',
                paddingTop: '0.5rem'
            },
            isExpanded: true,
            isEnabled: true
        }
        this.setExpanded = this.setExpanded.bind(this);
        this.setEnabled = this.setEnabled.bind(this);
        this.setSelected = this.setSelected.bind(this);
        this.updateEnabled = this.updateEnabled.bind(this);
    }
    static propTypes = {
        algorithm: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired,
        updateSelected: PropTypes.func.isRequired,
        selectionControl: PropTypes.bool.isRequired,
        algKey: PropTypes.number.isRequired
    }

    setExpanded(){
        this.setState({isExpanded: !this.state.isExpanded});
    }

    setEnabled(){
        this.setState({isEnabled: !this.state.isEnabled}, () => {
            if (this.state.isEnabled === false && this.props.selectionControl === true){
                this.props.updateSelected(this.props.myKey, !this.props.selectionControl);
            }
        });
    }

    updateEnabled(){
        this.setState({ isEnabled: !this.state.isEnabled});
    }

    setSelected(){
        if (this.state.isEnabled) {
            this.props.updateSelected(this.props.myKey, !this.props.selectionControl);
        }
    }

    render() {
        return (
            <div>
                <MetaData 
                    isVisible={this.state.isEnabled ? this.props.selectionControl : false}
                    detectorType={this.props.configurationInfo.type}
                    detectorConfigType={this.props.configurationInfo.configuration}
                    seriesType={this.props.configurationInfo.series}
                    studyType={this.props.configurationInfo.study}
                />
                <div style={this.props.selectionControl && this.state.isEnabled ? {
                        ...this.state.containerStyle,
                        backgroundColor: '#367EFF'
                    } : this.state.containerStyle}>
                    <svg style={this.state.arrowStyle} onClick={this.setExpanded} transform={this.state.isExpanded ? "rotate(90)" : ""} viewBox="0 0 24 24">
                        <g id="ic_menu_arrow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="arrow_right-24px-copy">
                                <polygon id="Path" fill="#FFFFFF" fillRule="nonzero" points="10 17 15 12 10 7"></polygon>
                                <polygon id="Path" points="0 24 0 0 24 0 24 24"></polygon>
                            </g>
                        </g>
                    </svg>
                    <div onClick={this.setSelected} style={ this.state.isEnabled ? this.state.typeStyles :  {
                        ...this.state.typeStyles,
                        color: 'gray'
                    } }>Algorithm - {this.props.algorithm.algorithm}</div>
                    {this.state.isEnabled ? 
                        <Icons.EyeO onClick={this.setEnabled} style={this.state.eyeStyle} />
                        : 
                        <Icons.EyeC onClick={this.setEnabled} style={this.state.eyeStyle} />
                    }
                </div>                
                <div id='detection-holder'>
                    {this.props.algorithm.data.top !== undefined && this.state.isExpanded===true ? 
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
                                <TreeDetection 
                                    detection={value} 
                                    selected={this.state.isEnabled ? this.props.selectionControl : false} 
                                    enabled={this.state.isEnabled} 
                                    updateEnabled={this.updateEnabled}
                                    detectionColor={detectionColor} 
                                    key={index}
                                />
                            )
                        })
                        : 
                        // If no data
                        <span></span>
                    }
                    {/* Repeating the process for the side stack if it exists */}
                    {this.props.algorithm.data.side !== undefined && this.state.isExpanded===true ? 
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
                                <TreeDetection
                                    detection={value}
                                    selected={this.state.isEnabled ? this.props.selectionControl : false} 
                                    enabled={this.state.isEnabled} 
                                    updateEnabled={this.updateEnabled}
                                    detectionColor={detectionColor} 
                                    key={index} 
                                />
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