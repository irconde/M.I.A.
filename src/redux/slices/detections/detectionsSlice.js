import { createSlice } from '@reduxjs/toolkit';
import './util/typedef';
import {
    createDetectionSet,
    addDetectionToSet,
    clearAll,
    clearSelection,
    isValidated,
    getDetectionsFromView,
} from './util/DetectionSet';
import { createDetection } from './util/Detection';
const detectionsSlice = createSlice({
    name: 'detections',
    initialState: {},
    reducers: {
        // Adds a DetectionSet to state object
        addDetectionSet: (state, action) => {
            const { payload } = action;
            const detectionSet = createDetectionSet({
                algorithm: payload.algorithm,
                visibility: payload.visibility,
            });

            state[detectionSet.algorithm] = detectionSet;
        },
        // Adds detection to a DetectionSet
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
            if (algo in state) {
                const updatedDetectionSet = addDetectionToSet(
                    state[algo],
                    detection
                );
                state[algo] = updatedDetectionSet;
            }
        },
        // Clears selection data for specified algorithm
        clearSelectedDetection: (state, action) => {
            const { payload } = action;
            const updatedDetectionSet = clearSelection(
                state[payload.algorithm]
            );

            state[payload.algorithm] = updatedDetectionSet;
        },
        // Clears selection data for all DetectionSets and their Detections
        clearAllSelection: (state) => {
            for (const detectionSet in state) {
                state[detectionSet] = clearAll(state[detectionSet]);
            }
        },
    },
});

// Selectors & Helper Functions

/**
 * Determines if all detections in all detectionSets have been validated
 * @param {Object.<string, DetectionSet>} state Redux Detections state
 * @returns {boolean} true if all are validated, false otherwise
 */
export const areDetectionsValidated = (state) => {
    let result = true;

    Object.values(state).forEach((detectionSet) => {
        if (!isValidated(detectionSet)) {
            result = false;
        }
    });

    return result;
};

/**
 * Get all Detections for a view
 * @param {Object.<string, DetectionSet>} state Redux Detections state
 * @param {string} view view to query
 * @returns {Array<Detection>}
 */
export const detectionsFromView = (state, view) => {
    let detections = [];

    Object.entries(state).forEach(([_, detectionSet]) => {
        detections = [
            ...detections,
            ...getDetectionsFromView(detectionSet, view),
        ];
    });

    return detections;
};

export const {
    addDetectionSet,
    addDetection,
    clearSelectedDetection,
    clearAllSelection,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
