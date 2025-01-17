import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TreeDetection from './side-menu-detection.component';
import * as constants from '../../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import Utils from '../../../utils/general/Utils';
import {
    clearAllSelection,
    getSelectedAlgorithm,
    selectDetectionSet,
    updateDetectionSetVisibility,
} from '../../../redux/slices-old/detections/detectionsSlice';
import { menuDetectionSelectedUpdate } from '../../../redux/slices-old/ui/uiSlice';
import {
    CollapsableArrowIconContainer,
    SideMenuAlgorithm,
    SideMenuAlgorithmName,
} from './side-menu-algorithm.styles';
import { EyeIconWrapper } from '../side-menu.styles';
import VisibilityOnIcon from '../../../icons/side-menu/visibility-on-icon/visibility-on.icon';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOffIcon from '../../../icons/side-menu/visibility-off-icon/visibility-off.icon';
import ArrowIcon from '../../../icons/shared/arrow-icon/arrow.icon';

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
            (e.target.id === 'algorithm-container' ||
                e.target.id === 'algorithm-name') &&
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
                dispatch(clearAllSelection());
            }
        }
    };

    let algorithmDisplay =
        algorithm === constants.UNKNOWN
            ? algorithm
            : constants.ALGORITHM + ' - ' + algorithm;

    algorithmDisplay = Utils.truncateString(algorithmDisplay, 20);

    return (
        <div>
            <SideMenuAlgorithm
                selected={isAlgorithmSelected === algorithm && isVisible}
                id="algorithm-container"
                onClick={setSelected}>
                <CollapsableArrowIconContainer
                    onClick={() => setIsExpanded(!isExpanded)}>
                    <ArrowIcon
                        direction={isExpanded ? 'down' : 'right'}
                        width="1.5rem"
                        height="1.5rem"
                        color="white"
                    />
                </CollapsableArrowIconContainer>
                <SideMenuAlgorithmName
                    id="algorithm-name"
                    anyDetectionVisible={anyVisible}>
                    {algorithmDisplay}
                </SideMenuAlgorithmName>

                <Tooltip title={anyVisible ? 'Hide' : 'Make visible'}>
                    <EyeIconWrapper onClick={setVisibility}>
                        {anyVisible ? (
                            <VisibilityOnIcon
                                height="20px"
                                width="20px"
                                color="#b9b9b9"
                            />
                        ) : (
                            <VisibilityOffIcon
                                height="20px"
                                width="20px"
                                color="#494949"
                            />
                        )}
                    </EyeIconWrapper>
                </Tooltip>
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
