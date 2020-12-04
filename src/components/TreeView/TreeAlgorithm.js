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
                margin: 'auto',
                cursor: 'default'
            },
            containerStyle: {
                paddingBottom: '0.5rem',
                paddingTop: '0.5rem'
            },
            isExpanded: true,
            isEnabled: true,
            isSelected: false
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
        myKey: PropTypes.number.isRequired
    }

    /**
     * setExpanded - Function that controls if the current algorithm is
     *               displaying as a list or collapsed down.
     * 
     * @param {type} none 
     * @returns {type} none
     */
    setExpanded(){
        this.setState({isExpanded: !this.state.isExpanded}, () => {
            if (this.state.isExpanded === false && this.props.selectionControl) {
                this.props.updateSelected(this.props.myKey, !this.props.selectionControl);
            }
        });
    }

    /**
     * setEnabled - Is the function that controls the eye visibility. There is
     *              a special case when if we click the eye to disable the algorithm,
     *              then we need to set the selected value to false if it is true.
     * 
     * @param {type} none 
     * @returns {type} none
     */
    setEnabled(){
        this.setState({isEnabled: !this.state.isEnabled}, () => {
            if (this.state.isEnabled === false && this.props.selectionControl === true){
                this.props.updateSelected(this.props.myKey, !this.props.selectionControl);
            }
        });
    }

    /**
     * updateEnabled - Function is for the TreeDetection component, we pass this in as a prop.
     *                 Because, this is how we control if we need to re-enable the entire algorithm.
     *                 If in the case that the algorithm is was set to disabled and we clicked one
     *                 of the individual detections eye in the algorithm, then we want to re-enable the
     *                 algorithm.
     * 
     * @param {type} none 
     * @returns {type} none
     */
    updateEnabled(){
        this.setState({ isEnabled: !this.state.isEnabled});
    }

    updateSelected() {
        this.props.updateSelected(this.props.myKey, !this.props.selectionControl);
    }

    /**
     * setSelected - Is the function that will set our algorithm to be selected or not,
     *               that is when you click the algorithm name and the color of it and
     *               its detection are changed. We call the passed in function letting it
     *               know which algorithm to change its value based on the algorithm index.
     * 
     * @param {type} none 
     * @returns {type} none
     */
    setSelected(e){
        if (e.target.id !== 'Path' && e.target.id !== 'arrow' && this.state.isExpanded && this.state.isEnabled) {
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
                <div onClick={this.setSelected} style={this.props.selectionControl && this.state.isEnabled ? {
                        ...this.state.containerStyle,
                        backgroundColor: '#367EFF'
                    } : this.state.containerStyle}>
                    
                    {this.state.isExpanded ? 
                        <Icons.ExpendedArrow 
                            id="arrow"
                            style={this.state.arrowStyle} 
                            onClick={this.setExpanded}
                        /> 
                        : 
                        <Icons.CollapsedArrow 
                            id="arrow"
                            style={this.state.arrowStyle} 
                            onClick={this.setExpanded} 
                        />}
                    <div style={ this.state.isEnabled ? this.state.typeStyles :  {
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
                            if (value.validation === undefined) {
                                detectionColor = 'black';
                            } else if (value.validation === false) {
                                detectionColor = constants.detectionStyle.INVALID_COLOR;
                            } else if (value.validation === true) {
                                detectionColor = constants.detectionStyle.VALID_COLOR;
                            }
                            return (
                                <TreeDetection 
                                    detection={value} 
                                    selected={this.state.isEnabled ? this.props.selectionControl : false} 
                                    enabled={this.state.isEnabled} 
                                    updateEnabled={this.updateEnabled}
                                    detectionColor={detectionColor} 
                                    key={index}
                                    updateSelected={this.updateSelected}
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
                            if (value.validation === undefined) {
                                detectionColor = 'black'
                            } else if (value.validation === false) {
                                detectionColor = constants.detectionStyle.INVALID_COLOR;
                            } else if (value.validation === true) {
                                detectionColor = constants.detectionStyle.VALID_COLOR;
                            }                            
                            return (
                                <TreeDetection
                                    detection={value}
                                    selected={this.state.isEnabled ? this.props.selectionControl : false} 
                                    enabled={this.state.isEnabled} 
                                    updateEnabled={this.updateEnabled}
                                    detectionColor={detectionColor} 
                                    key={index} 
                                    updateSelected={this.updateSelected}
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