import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
import './util/typedef';
import {
    createDetectionSet,
    addDetectionToSet,
    clearAll,
    clearSelection,
    isValidated,
    isEmpty,
    selectDetectionInSet,
    getClassNames,
    setLowerOpacity,
    updateDetectionLabelInSet,
    deleteDetectionFromSet,
} from './util/DetectionSet';
import { createDetection, getRenderColor } from './util/Detection';

const detectionsSlice = createSlice({
    name: 'detections',
    initialState: {
        // Selection data
        selectedAlgorithm: null,
        selectedDetection: null,
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
            state.selectedAlgorithm = null;
            state.selectedDetection = null;
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
                // Select the DetectionSet
                state.data[payload.algorithm] = updatedDetectionSet;
                state.selectedAlgorithm = payload.algorithm;
                state.selectedDetection = updatedDetectionSet.selectedDetection;
                // Clear selection on other DetectionSets
                state.algorithmNames.forEach((algo) => {
                    const cleared = clearAll(state.data[algo]);
                    state.data[algo] = setLowerOpacity(cleared);
                });
            } else {
                //TODO: better error handling
                console.warn(
                    `Detection with uuid ${payload.uuid} in view ${payload.view} and algorithm ${payload.algorithm} not selected.`
                );
            }
        },
        // Update properties on a detection
        // Action payload should contain:
        // {object} reference: contains uuid, algorithm, and view of detection to update
        // {object} update: contains any properties to update on the Detection
        updateDetection: (state, action) => {
            const { payload } = action;
            const { reference, update } = payload;

            const detectionIndex = state.data[reference.algorithm].data[
                reference.view
            ].findIndex((detection) => detection.uuid === reference.uuid);

            if (detectionIndex !== -1) {
                // Get a reference to the detection
                const updatedDetection =
                    state.data[reference.algorithm].data[reference.view][
                        detectionIndex
                    ];
                // Iterate over properties passed to reducer
                for (const prop in update) {
                    // Only update properties that exist
                    if (
                        Object.prototype.hasOwnProperty.call(
                            updatedDetection,
                            prop
                        )
                    ) {
                        updatedDetection.prop = update.prop;
                    }
                }
                // Update Redux state
                state.data[reference.algorithm].data[reference.view][
                    detectionIndex
                ] = updatedDetection;
            }
        },
        // Updates a Detection's class label.
        // Action payload should contain:
        // {string} algorithm - algorithm name for detection being updated
        // {string} uuid - uuid for detection being updated
        // {string} className - new label className for detection being updated
        editDetectionLabel: (state, action) => {
            const { payload } = action;

            const updatedDetectionSet = updateDetectionLabelInSet(
                state.data[payload.algorithm],
                payload.uuid,
                payload.view,
                payload.className
            );

            state.data[payload.algorithm] = updatedDetectionSet;
        },

        deleteDetection: (state, action) => {
            const { payload } = action;

            const updatedDetectionSet = deleteDetectionFromSet(
                state.data[payload.algorithm],
                payload.view,
                payload.uuid
            );

            if (isEmpty(updatedDetectionSet)) {
                delete state.data[payload.algorithm];
            } else {
                state.data[payload.algorithm] = updatedDetectionSet;
            }
        },
    },
});

// Selectors & Helper Functions

/**
 * Gets all unique class names from each Detection in each DetectionSet.
 * Used to populate the label list component for editing Detection labels
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @returns {Array<string>} array of all unique detection class names
 */
export const getDetectionLabels = (data) => {
    let classNames = [];

    for (const algo in data) {
        const labels = getClassNames(data[algo]);
        const uniqueLabels = labels.filter(
            (label) => !classNames.find((existing) => existing === label)
        );
        classNames = [...classNames, ...uniqueLabels];
    }

    return classNames;
};

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
export const getDetectionsFromView = (data, view) => {
    let detections = [];

    Object.values(data).forEach((detectionSet) => {
        detections = [...detectionSet.data[view], ...detections];
    });
    return detections;
};

/**
 * Get color of detection for bounding box rendering
 * @param {Detection} detection
 * @returns {string} color in string form
 */
export const getDetectionColor = (detection) => {
    return getRenderColor(detection);
};

export const {
    addDetectionSet,
    addDetection,
    clearSelectedDetection,
    clearAllSelection,
    selectDetection,
    updateDetection,
    editDetectionLabel,
    deleteDetection,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
