import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MetaData from '../Snackbars/MetaData';
import TreeDetection from './SideMenuDetection';
import * as Icons from './Icons';
import * as constants from '../../utils/Constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearAllSelection,
    getSelectedAlgorithm,
    selectDetectionSet,
    updateDetectionSetVisibility,
} from '../../redux/slices/detections/detectionsSlice';
import { menuDetectionSelectedUpdate } from '../../redux/slices/ui/uiSlice';

const SideMenuAlgorithm = ({
    detections,
    resetCornerstoneTools,
    renderDetectionContextMenu,
}) => {
    const dispatch = useDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    let [isVisible, setIsVisible] = useState(true);
    let anyVisible = true;
    for (let i = 0; i < detections.length; i++) {
        if (detections[i].visible) {
            anyVisible = true;
            break;
        } else {
            anyVisible = false;
        }
    }
    if (anyVisible !== isVisible) {
        isVisible = anyVisible;
    }
    const isAlgorithmSelected = useSelector(getSelectedAlgorithm);
    const algorithm = detections.length > 0 ? detections[0].algorithm : '';
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
        dispatch(
            updateDetectionSetVisibility({
                algorithm: algorithm,
                isVisible: !isVisible,
            })
        );
        setIsVisible(!isVisible);
    };

    /**
     * setSelected - Uses dispatch to select the algorithm and transforms the expand icon if clicked
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
            isExpanded &&
            isVisible
        ) {
            dispatch(selectDetectionSet(algorithm));
            dispatch(menuDetectionSelectedUpdate());
            resetCornerstoneTools();
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
                isVisible={isAlgorithmSelected === algorithm ? true : false}
            />
            <div
                style={
                    isAlgorithmSelected === algorithm && isVisible
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
                <div
                    id="algorithm-name"
                    style={
                        anyVisible
                            ? typeStyles
                            : { ...typeStyles, color: 'gray' }
                    }>
                    {algorithm === constants.OPERATOR
                        ? algorithm
                        : constants.ALGORITHM + ' - ' + algorithm}
                </div>
                {anyVisible ? (
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
                {detections !== undefined && isExpanded === true ? (
                    detections.map((detection, index) => {
                        return (
                            <TreeDetection
                                detection={detection}
                                key={index}
                                resetCornerstoneTools={resetCornerstoneTools}
                                renderDetectionContextMenu={
                                    renderDetectionContextMenu
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
    detections: PropTypes.array.isRequired,
    resetCornerstoneTools: PropTypes.func.isRequired,
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenuAlgorithm;
