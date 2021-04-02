import * as constants from '../../../../Constants';
import './typedef';
import cloneDeep from 'lodash.clonedeep';

/*
 * Utility funcitons for the `DetectionSet` object
 * Replaces DetectionSet class in order to conform with Redux
 * data requirements.
 * In most cases, the 'translations' of the old class methods now require the detectionSet
 * that is being operated on as a parameter and return a new detectionSet.
 * The `cloneDeep` package is used to make a deep copy, since JS uses shallow copies by default.
 */

/**
 * Constructor function to create DetectionSet object
 * @param {object} params object of initial/default props
 * @param {string} algorithm algorithm name
 * @param {boolean} selected whether the detection set has a detection that is selected
 * @param {string | undefined} selectedViewport if a detection is selected, which viewport it is in
 * @param {Detection | undefined} selectedDetection selected detection, if it exists
 * @param {boolean} visible whether the detection set is visible on screen
 * @param {object} data object of arrays of detection data by viewport
 * @param {boolean} lowerOpacity lower opacity when other detection set is selected
 * @param {number} numTopDetections length of `data.top` array
 * @param {number} numSideDetections length of `data.side` array
 * @returns {DetectionSet} new DetectionSet object
 */
export function createDetectionSet({
    algorithm,
    selected = false,
    selectedViewport = undefined,
    selectedDetectionIndex = constants.selection.NO_SELECTION,
    selectedDetection = undefined,
    data = {
        top: [],
        side: [],
    },
    lowerOpacity = false,
    numTopDetections = 0,
    numSideDetections = 0,
}) {
    return {
        algorithm,
        selected,
        selectedViewport,
        selectedDetectionIndex,
        selectedDetection,
        visible,
        data,
        lowerOpacity,
        numTopDetections,
        numSideDetections,
    };
}

/**
 * Validate a currently selected detection from user feedback
 * @param {DetectionSet} initial DetectionSet
 * @param {boolean} feedback user feedback indicating if detection is correct
 * @returns {DetectionSet} updated DetectionSet
 */
export function validateSelectedDetection(detectionSet, feedback) {
    if (detectionSet.selectedDetection !== undefined) {
        const updatedDetectionSet = cloneDeep(detectionSet);
        updatedDetectionSet.feedback = feedback;

        const reset = clearSelection(updatedDetectionSet);
        return reset;
    }
}

/**
 * De-selects current selectedDetection
 * @param {DetectionSet} detectionSet current DetectionSet
 * @returns {DetectionSet} updated DetectionSet
 */
export function clearSelection(detectionSet) {
    if (detectionSet.selectedDetection !== undefined) {
        const updatedDetectionSet = cloneDeep(detectionSet);
        updatedDetectionSet.selected = false;
        updatedDetectionSet.selectedViewport = undefined;
        updatedDetectionSet.selectedDetectionIndex =
            constants.selection.NO_SELECTION;
        updatedDetectionSet.selectedDetection = undefined;
        updatedDetectionSet.lowerOpacity = false;
        return updatedDetectionSet;
    }
}

/**
 * Resets all selection-related properties on set and each Detection
 * @param {DetectionSet} detectionSet
 * @returns {DetectionSet} updated DetectionSet
 */
export function clearAll(detectionSet) {
    const updatedDetectionSet = cloneDeep(detectionSet);
    updatedDetectionSet.selected = false;
    updatedDetectionSet.selectedDetection = undefined;
    updatedDetectionSet.lowerOpacity = false;
    updatedDetectionSet.selectedDetectionIndex =
        constants.selection.NO_SELECTION;

    const updatedData = Object.values(updatedDetectionSet.data).map((view) => {
        view.map((detection) => {
            detection.selected = false;
            detection.updatingDetection = false;
        });
    });
    updatedDetectionSet.data = updatedData;
    return updatedDetectionSet;
}

/**
 * Adds a new detection to a detectionSet
 * @param {DetectionSet} detectionSet existing detectionSet
 * @param {Detection} detection new detection to be added
 * @returns {DetectionSet} updated detectionSet
 */
export function addDetection(detectionSet, detection) {
    const viewport = detection.view;
    const algo = detection.algorithm;
    const updatedDetectionSet = cloneDeep(detectionSet);

    // Initialize `OPERATOR` view for user-added detections
    if (!updatedDetectionSet.data[viewport] && algo === constants.OPERATOR) {
        updatedDetectionSet.data[viewport] = [];
    }
    // Add detection to its view's data array
    updatedDetectionSet.data[viewport] = [
        ...updatedDetectionSet.data[viewport],
        detection,
    ];

    // Update detection counts for each view
    if (viewport === constants.viewport.TOP) {
        updatedDetectionSet.numTopDetections =
            updatedDetectionSet.data[viewport].length;
    } else {
        updatedDetectionSet.numSideDetections =
            updatedDetectionSet.data[viewport].length;
    }

    return updatedDetectionSet;
}

/**
 * Delete detection from detectionSet and update detection counts
 * @param {DetectionSet} detectionSet detectionSet that contains detection
 * @param {Detection} detection detection to be deleted
 */
export function deleteDetection(detectionSet, detection) {
    const viewport = detection.view;
    const uuid = detection.uuid;
    const updatedDetectionSet = cloneDeep(detectionSet);

    // Remove detection by filtering by its uuid
    const filterOut = updatedDetectionSet.data[viewport].filter((detec) => {
        detec.uuid !== uuid;
    });
    updatedDetectionSet.data[viewport] = filterOut;

    // Update detection counts
    if (viewport === constants.viewport.TOP) {
        updatedDetectionSet.numTopDetections =
            updatedDetectionSet.data[viewport].length;
    } else {
        updatedDetectionSet.numSideDetections =
            updatedDetectionSet.data[viewport].length;
    }
}

/**
 * Determine if each view in a DetectionSet is empty of detections
 * @returns {boolean} true if all views contain no detections, false otherwise
 */
export function isEmpty(detectionSet) {
    let result = true;
    const allData = detectionSet.data;
    Object.keys(allData).forEach((view) => {
        if (allData[view] && allData[view].length > 0) {
            // detections exist, the DetectionSet is not empty
            result = false;
        }
    });
    return result;
}
