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
                marginLeft: '0.5rem',
                marginRight: '0.5rem'
            },
            eyeStyle: {
                height: '1.5rem',
                width: '1.5rem',
                display: 'inline-block',
                float: 'right',
                marginRight: '1.0rem',
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
                paddingBottom: '0.75rem',
                paddingTop: '0.75rem'
            },
            isExpanded: true,
            isSelected: false
        }
        this.setExpanded = this.setExpanded.bind(this);
        this.setVisibility = this.setVisibility.bind(this);
        this.setSelected = this.setSelected.bind(this);
        this.updateSelectedDetection = this.updateSelectedDetection.bind(this);
        this.updateSelected = this.updateSelected.bind(this);
    }
    static propTypes = {
        algorithm: PropTypes.object.isRequired,
        configurationInfo: PropTypes.object.isRequired,
        updateSelected: PropTypes.func.isRequired,
        setVisibilityData: PropTypes.func.isRequired,
        updateSelectedDetection: PropTypes.func.isRequired,
        myKey: PropTypes.number.isRequired,
        updateImage: PropTypes.func.isRequired,
        hideButtons: PropTypes.func.isRequired
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
            if (this.state.isExpanded === false && this.props.algorithm.selected) {
                this.props.updateSelected(!this.props.algorithm.selected, this.props.algorithm.algorithm);
            }
        });
    }

    /**
     * setVisibility - Is the function that controls the eye visibility.
     *
     * @param {type} none
     * @returns {type} none
     */
    setVisibility(){
        this.props.setVisibilityData(this.props.algorithm.algorithm, this.props.algorithm.visibility);
    }

    /**
     * updateSelected() - Control how each algorithm is selected and deselected
     *
     * @param {type} none
     * @returns {type} none
     */
    updateSelected() {
        this.props.updateSelected(!this.props.algorithm.selected, this.props.algorithm.algorithm);
    }

    /**
     * updateSelectedDetection() - Is the controller between the TreeDetection Component and
     *                             SideMenu Component that contains the control logic for selecting
     *                             detection. The TreeDetection component passes in its current detection
     *
     *
     * @param {Detection} detection
     */
    updateSelectedDetection(detection, e) {
        this.props.updateSelectedDetection(detection, e);
    }

    /**
     * setSelected - Is the function that will set our algorithm to be selected or not,
     *               that is when you click the algorithm name and the color of it and
     *               its detection are changed. We call the passed in function letting it
     *               know which algorithm to change its value the current components algorithm object
     *
     * @param {Event} e
     * @returns {type} none
     */
    setSelected(e){
        if (this.props.algorithm.visibility === true) {
            if (e.target.id !== 'Path' && e.target.id !== 'eye' && e.target.id !== 'Shape' && e.target.id !== 'arrow' && this.state.isExpanded) {
                this.props.updateSelected(!this.props.algorithm.selected, this.props.algorithm.algorithm);
            }
        }
    }

    render() {
        return (
            <div>
                <MetaData
                    isVisible={this.props.algorithm.visibility ? this.props.algorithm.selected : false}
                    detectorType={this.props.configurationInfo.type}
                    detectorConfigType={this.props.configurationInfo.configuration}
                    seriesType={this.props.configurationInfo.series}
                    studyType={this.props.configurationInfo.study}
                />
                <div onClick={this.setSelected} style={this.props.algorithm.selected && this.props.algorithm.visibility ? {
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
                    <div id="algorithm-name" style={ this.props.algorithm.visibility ? this.state.typeStyles :  {
                        ...this.state.typeStyles,
                        color: 'gray'
                    } }>Algorithm - {this.props.algorithm.algorithm}</div>
                    {this.props.algorithm.visibility ?
                        <Icons.EyeO id="eye" onClick={this.setVisibility} style={this.state.eyeStyle} />
                        :
                        <Icons.EyeC id="eye" onClick={this.setVisibility} style={this.state.eyeStyle} />
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
                                    visible={this.props.algorithm.visibility}
                                    updateImage={this.props.updateImage}
                                    detectionColor={detectionColor}
                                    key={index}
                                    updateSelectedDetection={this.updateSelectedDetection}
                                    algorithmSelected={this.props.algorithm.selected}
                                    hideButtons={this.props.hideButtons}
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
                                    visible={this.props.algorithm.visibility}
                                    updateImage={this.props.updateImage}
                                    detectionColor={detectionColor}
                                    key={index}
                                    updateSelectedDetection={this.updateSelectedDetection}
                                    algorithmSelected={this.props.algorithm.selected}
                                    hideButtons={this.props.hideButtons}
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
