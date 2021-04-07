import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
import './util/typedef';
import {
    createDetectionSet,
    addDetectionToSet,
    clearAll,
    clearSelection,
    isValidated,
    selectDetectionInSet,
} from './util/DetectionSet';
import { createDetection } from './util/Detection';
const detectionsSlice = createSlice({
    name: 'detections',
    initialState: {
        // Selection data
        selectedAlgorithm: constants.selection.NO_SELECTION,
        algorithmNames: [],
        // Normal detectionSet data using the algorithm name as the key and the detectionSet as the value
        data: {},
    },
    reducers: {
        // Adds a DetectionSet to state object
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {boolean} visible - whether detections in set are visible (optional)
        addDetectionSet: (state, action) => {
            const { payload } = action;
            const detectionSet = createDetectionSet({
                algorithm: payload.algorithm,
                visible: payload.visibility,
            });

            state.data[detectionSet.algorithm] = detectionSet;
            state.algorithmNames.push(detectionSet.algorithm);
        },
        // Adds detection to a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {Array<Array<number>>} maskBitmap - maskBitmap data, if any
        // {Array<number>} boundingBox - boundingBox data [x0, y0, x1, y1]
        // {string} className - name of detection classification
        // {number} confidence - confidence in detection
        // {string} view - where detection is rendered
        addDetection: (state, action) => {
            const { payload } = action;
            const detection = createDetection({
                algorithm: payload.algorithm,
                maskBitmap: payload.maskBitmap,
                boundingBox: payload.boundingBox,
                className: payload.className,
                confidence: payload.confidence,
                view: payload.view,
            });

            const algo = detection.algorithm;
            if (algo in state.data) {
                const updatedDetectionSet = addDetectionToSet(
                    state.data[algo],
                    detection
                );
                state.data[algo] = updatedDetectionSet;
            }
        },
        // Clears selection data for specified algorithm
        // Action payload should contain:
        // {string} algorithm - algorithm name
        clearSelectedDetection: (state, action) => {
            const { payload } = action;
            const updatedDetectionSet = clearSelection(
                state.data[payload.algorithm]
            );

            state.data[payload.algorithm] = updatedDetectionSet;
        },
        // Clears selection data for all DetectionSets and their Detections
        // No action payload used
        clearAllSelection: (state) => {
            for (const detectionSet in state.data) {
                state.data[detectionSet] = clearAll(state.data[detectionSet]);
            }
            state.selectedAlgorithm = constants.selection.NO_SELECTION;
        },
        // Selects a detection from a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {string} view - where detection is rendered
        // {string} uuid - unique identifier for detection
        selectDetection: (state, action) => {
            const { payload } = action;

            const updatedDetectionSet = selectDetectionInSet(
                state.data[payload.algorithm],
                payload.view,
                payload.uuid
            );

            if (updatedDetectionSet) {
                state.data[payload.algorithm] = updatedDetectionSet;
                state.selectedAlgorithm = payload.algorithm;
            } else {
                //TODO: better error handling
                console.warn(
                    `Detection with uuid ${payload.uuid} in view ${payload.view} and algorithm ${payload.algorithm} not selected.`
                );
            }
        },
    },
});

// Selectors & Helper Functions

/**
 * Determines if all detections in all detectionSets have been validated
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @returns {boolean} true if all are validated, false otherwise
 */
export const areDetectionsValidated = (data) => {
    let result = true;

    Object.values(data).forEach((detectionSet) => {
        if (!isValidated(detectionSet)) {
            result = false;
        }
    });

    return result;
};

/**
 * Get all Detections for a view
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @param {string} view view to query
 * @returns {Array<Detection>}
 */
export const detectionsFromView = (data, view) => {
    let detections = [];

    Object.values(data).forEach((detectionSet) => {
        console.log(detectionSet);
        detections = [...detectionSet.data[view], ...detections];
    });
    return detections;
};

export const {
    addDetectionSet,
    addDetection,
    clearSelectedDetection,
    clearAllSelection,
    selectDetection,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
