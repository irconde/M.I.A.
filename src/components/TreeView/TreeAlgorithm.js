import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MetaData from '../Snackbars/MetaData';
import TreeDetection from './TreeDetection';
import * as Icons from './Icons';
import * as constants from '../../Constants';
import { useSelector } from 'react-redux';
import { getSelectedAlgorithm } from '../../redux/slices/detections/detectionsSlice';

const TreeAlgorithm = ({ configurationInfo, detections, updateImage }) => {
    const arrowStyle = {
        height: '1.5rem',
        width: '1.5rem',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        transform: 'rotate(90deg)',
    };
    const eyeStyle = {
        height: '1.5rem',
        width: '1.5rem',
        display: 'inline-block',
        float: 'right',
        marginRight: '1.0rem',
    };
    const typeStyles = {
        fontSize: 14,
        verticalAlign: 'super',
        fontFamily: 'Noto Sans JP',
        display: 'inline-block',
        margin: 'auto',
        cursor: 'default',
    };
    const containerStyle = {
        paddingBottom: '0.75rem',
        paddingTop: '0.75rem',
    };
    const [isExpanded, setIsExpanded] = useState < Boolean > true;
    const [isSelected, setIsSelected] = useState < Boolean > false;
    const isAlgorithmSelected = useSelector(getSelectedAlgorithm);

    /**
     * setVisibility - Is the function that controls the eye visibility.
     *
     * @param {type} none
     * @returns {type} none
     */
    const setVisibility = () => {
        // this.props.setVisibilityData(
        //     this.props.algorithm.algorithm,
        //     this.props.algorithm.visibility
        // );
    };

    /**
     * updateSelected() - Control how each algorithm is selected and deselected
     *
     * @param {type} none
     * @returns {type} none
     */
    const updateSelected = () => {
        // this.props.updateSelected(
        //     !this.props.algorithm.selected,
        //     this.props.algorithm.algorithm
        // );
    };

    /**
     * updateSelectedDetection() - Is the controller between the TreeDetection Component and
     *                             SideMenu Component that contains the control logic for selecting
     *                             detection. The TreeDetection component passes in its current detection
     *
     *
     * @param {Detection} detection
     */
    const updateSelectedDetection = (detection, e) => {
        // this.props.updateSelectedDetection(detection, e);
    };

    /**
     * setSelected - Is the function that will set our algorithm to be selected or not,
     *               that is when you click the algorithm name and the color of it and
     *               its detection are changed. We call the passed in function letting it
     *               know which algorithm to change its value the current components algorithm object
     *
     * @param {Event} e
     * @returns {type} none
     */
    const setSelected = (e) => {
        // if (this.props.algorithm.visibility === true) {
        //     if (
        //         e.target.id !== 'Path' &&
        //         e.target.id !== 'eye' &&
        //         e.target.id !== 'Shape' &&
        //         e.target.id !== 'arrow' &&
        //         this.state.isExpanded
        //     ) {
        //         // this.props.updateSelected(
        //         //     !this.props.algorithm.selected,
        //         //     this.props.algorithm.algorithm
        //         // );
        //     } else {
        //         if (e.target.id == 'arrow' || e.target.id == 'Path') {
        //             let rotationValue = this.state.arrowStyle.transform;
        //             if (
        //                 rotationValue ==
        //                 constants.PERPENDICULAR_DEGREE_TRANSFORM
        //             ) {
        //                 rotationValue = constants.ZERO_DEGREE_TRANSFORM;
        //             } else {
        //                 rotationValue =
        //                     constants.PERPENDICULAR_DEGREE_TRANSFORM;
        //             }
        //             this.setState({
        //                 arrowStyle: {
        //                     height: 1.5 + 'rem',
        //                     width: 1.5 + 'rem',
        //                     marginLeft: 0.5 + 'rem',
        //                     marginRight: 0.5 + 'rem',
        //                     transform: rotationValue,
        //                 },
        //             });
        //         }
        //     }
        // }
    };

    return (
        <div>
            <MetaData
                isVisible={isAlgorithmSelected !== null ? true : false}
                // TODO: James B. - Remove this once refactored into uiSlice
                detectorType={configurationInfo.type}
                detectorConfigType={configurationInfo.configuration}
                seriesType={configurationInfo.series}
                studyType={configurationInfo.study}
            />
            <div
                onClick={setSelected}
                style={
                    isAlgorithmSelected !== null &&
                    this.props.algorithm.visibility
                        ? {
                              ...containerStyle,
                              backgroundColor: '#367EFF',
                          }
                        : containerStyle
                }>
                {isExpanded ? (
                    <Icons.ExpendedArrow
                        id="arrow"
                        style={arrowStyle}
                        onClick={setIsExpanded(!isExpanded)}
                    />
                ) : (
                    <Icons.CollapsedArrow
                        id="arrow"
                        style={arrowStyle}
                        onClick={setIsExpanded(!isExpanded)}
                    />
                )}
                <div
                    id="algorithm-name"
                    style={
                        this.props.algorithm.visibility
                            ? typeStyles
                            : {
                                  ...typeStyles,
                                  color: 'gray',
                              }
                    }>
                    {this.props.algorithm.algorithm.localeCompare('OPERATOR') ==
                    0
                        ? this.props.algorithm.algorithm
                        : constants.ALGORITHM +
                          ' - ' +
                          this.props.algorithm.algorithm}
                </div>
                {this.props.algorithm.visibility ? (
                    <Icons.EyeO
                        id="eye"
                        onClick={setVisibility}
                        style={eyeStyle}
                    />
                ) : (
                    <Icons.EyeC
                        id="eye"
                        onClick={setVisibility}
                        style={eyeStyle}
                    />
                )}
            </div>
            <div id="detection-holder">
                {detections !== undefined && this.state.isExpanded === true ? (
                    detections.map((value, index) => {
                        return (
                            <TreeDetection
                                detection={value}
                                updateImage={this.props.updateImage}
                                key={index}
                                algorithmVisible={
                                    this.props.algorithm.visibility
                                }
                            />
                        );
                    })
                ) : (
                    // If no data
                    <span></span>
                )}
            </div>
        </div>
    );
};

TreeAlgorithm.propTypes = {
    detections: PropTypes.array.isRequired,
    // TODO: James B. - Remove this once refactored into uiSlice
    configurationInfo: PropTypes.object.isRequired,
    updateImage: PropTypes.func.isRequired,
};

export default TreeAlgorithm;
