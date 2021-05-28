import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MetaData from '../Snackbars/MetaData';
import TreeDetection from './SideMenuDetection';
import * as Icons from './Icons';
import * as constants from '../../Constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearAllSelection,
    clearSelectedAlgorithm,
    getSelectedAlgorithm,
    selectDetectionSet,
} from '../../redux/slices/detections/detectionsSlice';

const SideMenuAlgorithm = ({
    configurationInfo,
    detections,
    resetCornerstoneTools,
    resetSelectedDetectionBoxes,
}) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isSelected, setIsSelected] = useState(false);
    const isAlgorithmSelected = useSelector(getSelectedAlgorithm);
    let arrowStyle = {
        height: '1.5rem',
        width: '1.5rem',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        transform: isExpanded
            ? constants.PERPENDICULAR_DEGREE_TRANSFORM
            : constants.ZERO_DEGREE_TRANSFORM,
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
     * setSelected - Is the function that will set our algorithm to be selected or not,
     *               that is when you click the algorithm name and the color of it and
     *               its detection are changed. We call the passed in function letting it
     *               know which algorithm to change its value the current components algorithm object
     *
     * @param {Event} e
     * @returns {type} none
     */
    const setSelected = (e) => {
        if (
            e.target.id !== 'Path' &&
            e.target.id !== 'eye' &&
            e.target.id !== 'Shape' &&
            e.target.id !== 'arrow' &&
            isExpanded
        ) {
            dispatch(selectDetectionSet(detections[0].algorithm));
        } else {
            if (e.target.id == 'arrow' || e.target.id == 'Path') {
                let rotationValue = arrowStyle.transform;
                if (rotationValue == constants.PERPENDICULAR_DEGREE_TRANSFORM) {
                    rotationValue = constants.ZERO_DEGREE_TRANSFORM;
                } else {
                    rotationValue = constants.PERPENDICULAR_DEGREE_TRANSFORM;
                }
                arrowStyle = {
                    ...arrowStyle,
                    transform: rotationValue,
                };
                dispatch(clearAllSelection());
            }
        }
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
                style={
                    isAlgorithmSelected === detections[0].algorithm
                        ? {
                              ...containerStyle,
                              backgroundColor:
                                  constants.detectionStyle.SELECTED_COLOR,
                          }
                        : containerStyle
                }
                onClick={setSelected}>
                {isExpanded ? (
                    <Icons.ExpendedArrow
                        id="arrow"
                        style={arrowStyle}
                        onClick={() => setIsExpanded(!isExpanded)}
                    />
                ) : (
                    <Icons.CollapsedArrow
                        id="arrow"
                        style={arrowStyle}
                        onClick={() => setIsExpanded(!isExpanded)}
                    />
                )}
                <div style={typeStyles}>
                    {constants.ALGORITHM + ' - ' + detections[0].algorithm}
                </div>
                <Icons.EyeO id="eye" onClick={setVisibility} style={eyeStyle} />
            </div>
            <div id="detection-holder">
                {detections !== undefined && isExpanded === true ? (
                    detections.map((detection, index) => {
                        return (
                            <TreeDetection
                                detection={detection}
                                key={index}
                                algorithmVisible={true}
                                resetCornerstoneTools={resetCornerstoneTools}
                                resetSelectedDetectionBoxes={
                                    resetSelectedDetectionBoxes
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

SideMenuAlgorithm.propTypes = {
    // TODO: James B. - Remove this once refactored into uiSlice
    configurationInfo: PropTypes.object.isRequired,
    detections: PropTypes.array.isRequired,
    resetSelectedDetectionBoxes: PropTypes.func.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
};

export default SideMenuAlgorithm;
