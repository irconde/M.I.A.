import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TreeDetection from './side-menu-detection.component';
import * as Icons from '../Icons';
import * as constants from '../../../utils/Constants';
import { useDispatch, useSelector } from 'react-redux';
import Utils from '../../../utils/Utils';
import {
    clearAllSelection,
    getSelectedAlgorithm,
    selectDetectionSet,
    updateDetectionSetVisibility,
} from '../../../redux/slices/detections/detectionsSlice';
import { menuDetectionSelectedUpdate } from '../../../redux/slices/ui/uiSlice';
import {
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
    EyeIconWrapper,
} from './side-menu-algorithm.styles';
import EyeOpenIcon from '../../../icons/side-menu/eye-open-icon/eye-open.icon';
import Tooltip from '@mui/material/Tooltip';

/**
 * Helper component for SideMenuComponent component that allows user to view and sort detections by algorithm
 *
 * @component
 *
 *
 */
const SideMenuAlgorithmComponent = ({
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
        height: '20px',
        width: '20px',
        display: 'inline-block',
        float: 'right',
        marginRight: '1.0rem',
        paddingTop: '0.2rem',
    };

    /**
     * Updates the eye-like icon's visibility.
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
     * Uses dispatch to select the algorithm and transforms the expand icon if clicked
     * @param {Event} e
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
            if (isAlgorithmSelected !== algorithm) {
                dispatch(selectDetectionSet(algorithm));
                dispatch(menuDetectionSelectedUpdate());
            } else {
                dispatch(clearAllSelection());
            }
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

    let algorithmDisplay =
        algorithm === constants.OPERATOR
            ? algorithm
            : constants.ALGORITHM + ' - ' + algorithm;

    algorithmDisplay = Utils.truncateString(algorithmDisplay, 20);

    return (
        <div>
            <SideMenuAlgorithm
                selected={isAlgorithmSelected === algorithm && isVisible}
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
                <SideMenuAlgorithmName
                    id="algorithm-name"
                    anyDetectionVisible={anyVisible}>
                    {algorithmDisplay}
                </SideMenuAlgorithmName>
                {anyVisible ? (
                    <Tooltip title="Hide">
                        <EyeIconWrapper onClick={setVisibility}>
                            <EyeOpenIcon
                                height="20px"
                                width="20px"
                                color="white"
                            />
                        </EyeIconWrapper>
                    </Tooltip>
                ) : (
                    <Icons.EyeC
                        id="eye"
                        onClick={setVisibility}
                        style={eyeStyle}
                    />
                )}
            </SideMenuAlgorithm>
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

SideMenuAlgorithmComponent.propTypes = {
    /**
     * Array of detection objects
     */
    detections: PropTypes.array.isRequired,
    /**
     * Callback to reset cornerstone tools to initial values
     */
    resetCornerstoneTools: PropTypes.func.isRequired,
    /**
     * Callback to render specific detection context menus
     */
    renderDetectionContextMenu: PropTypes.func.isRequired,
};

export default SideMenuAlgorithmComponent;
