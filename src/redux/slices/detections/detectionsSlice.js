import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
import './util/typedef';
import DetectionSetUtil from './util/DetectionSet';
import DetectionUtil from './util/Detection';

const initialState = {
    // Selection data
    /** @type string */
    selectedAlgorithm: null,
    /** @type Detection */
    selectedDetection: null,
    /** @type Array<string> */
    algorithmNames: [],

    // Normal detectionSet data using the algorithm name as the key and the detectionSet as the value
    /** @type Object<string, DetectionSet> */
    data: {},
};

const detectionsSlice = createSlice({
    name: 'detections',
    initialState,
    reducers: {
        // Reset store to default values
        resetDetections: (state) => {
            state.selectedAlgorithm = null;
            state.selectedDetection = null;
            state.algorithmNames = [];
            state.data = {};
        },
        // Adds a DetectionSet to state object
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {boolean} visible - whether detections in set are visible (optional)
        addDetectionSet: (state, action) => {
            const { payload } = action;
            const detectionSet = DetectionSetUtil.createDetectionSet({
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
            const detection = DetectionUtil.createDetection({
                algorithm: payload.algorithm,
                maskBitmap: payload.maskBitmap,
                boundingBox: payload.boundingBox,
                className: payload.className,
                confidence: payload.confidence,
                view: payload.view,
                blobData: payload.blobData,
            });

            const algo = detection.algorithm;
            if (algo in state.data) {
                const updatedDetectionSet = DetectionSetUtil.addDetectionToSet(
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
            const updatedDetectionSet = DetectionSetUtil.clearSelection(
                state.data[payload.algorithm]
            );

            state.data[payload.algorithm] = updatedDetectionSet;
        },
        // Clears selection data for all DetectionSets and their Detections
        // No action payload used
        clearAllSelection: (state) => {
            for (const detectionSet in state.data) {
                state.data[detectionSet] = DetectionSetUtil.clearAll(
                    state.data[detectionSet]
                );
            }
            state.selectedAlgorithm = null;
            state.selectedDetection = null;
        },
        // Select a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        selectDetectionSet: (state, action) => {
            const { payload } = action;

            if (state.data[payload.algorithm]) {
                state.selectedAlgorithm = payload.algorithm;
                state.selectedDetection = constants.selection.ALL_SELECTED;

                state.algorithmNames.forEach((algo) => {
                    if (algo === payload.algorithm) {
                        state.data[algo] = DetectionSetUtil.selectDetectionSet(
                            state.data[algo]
                        );
                    }
                    // Clear selection and set lowerOpacity on other DetectionSets
                    else {
                        state.data[algo] = DetectionSetUtil.setLowerOpacity(
                            DetectionSetUtil.clearAll(state.data[algo])
                        );
                    }
                });
            }
        },
        // Selects a detection from a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {string} view - where detection is rendered
        // {string} uuid - unique identifier for detection
        selectDetection: (state, action) => {
            const { payload } = action;
            const updatedDetectionSet = DetectionSetUtil.selectDetectionInSet(
                state.data[payload.algorithm],
                payload.view,
                payload.uuid
            );

            if (updatedDetectionSet) {
                state.algorithmNames.forEach((algo) => {
                    if (state.data[algo]) {
                        if (algo === updatedDetectionSet.algorithm) {
                            // Select the DetectionSet
                            state.data[algo] = DetectionSetUtil.setLowerOpacity(
                                updatedDetectionSet
                            );
                        } else {
                            state.data[algo] = DetectionSetUtil.setLowerOpacity(
                                DetectionSetUtil.clearAll(state.data[algo])
                            );
                        }
                    }
                });
                state.selectedAlgorithm = payload.algorithm;
                state.selectedDetection = updatedDetectionSet.selectedDetection;
            } else {
                //TODO: better error handling?
                console.warn(
                    `Detection with uuid ${payload.uuid} in view ${payload.view} and algorithm ${payload.algorithm} not selected.`
                );
            }
        },
        // Update properties on a detection
        // Used for any action that is not selecting or deleting a detection
        // Action payload should contain:
        // {object} reference: contains uuid, algorithm, and view of detection to update
        // {object} update: contains any properties to update on the Detection
        updateDetection: (state, action) => {
            try {
                const { payload } = action;
                const { reference, update } = payload;

                const detectionIndex = state.data[reference.algorithm].data[
                    reference.view
                ].findIndex((detection) => detection.uuid === reference.uuid);

                if (detectionIndex === -1) {
                    throw new Error(
                        `Detection not found, check reference properties: ${JSON.stringify(
                            reference
                        )}`
                    );
                }
                const updatedDetection = DetectionUtil.updateDetection(
                    state.data[reference.algorithm].data[reference.view][
                        detectionIndex
                    ],
                    update
                );

                if (!updatedDetection) {
                    throw new Error(
                        `Detection not updated: ${JSON.stringify(
                            reference
                        )} Check update payload: ${JSON.stringify(update)}`
                    );
                }

                // Update Redux state
                state.data[reference.algorithm].data[reference.view][
                    detectionIndex
                ] = updatedDetection;
            } catch (error) {
                console.error(error);
            }
        },

        // Update properties on a DetectionSet
        // Use for any action not covered in other reducers
        // Action payload should contain:
        // {string} algorithm - algorithm name for DetectionSet to update
        // {object} update - contains any properties to update on the DetectionSet
        updateDetectionSet: (state, action) => {
            const payload = { action };

            const detectionSet = state[payload.algorithm];

            if (detectionSet) {
                const updatedDetectionSet = DetectionSetUtil.updateDetectionSet(
                    detectionSet,
                    payload.update
                );

                if (updatedDetectionSet) {
                    state[payload.algorithm] = updatedDetectionSet;
                } else {
                    console.warn(
                        `DetectionSet with algorithm ${
                            payload.algorithm
                        } not updated because the update payload was invalid: ${JSON.stringify(
                            payload.update
                        )}`
                    );
                }
            } else {
                console.warn(
                    `DetectionSet with algorithm ${payload.algorithm} not found. Update not applied`
                );
            }
        },
        // Updates a Detection's class label.
        // Action payload should contain:
        // {string} algorithm - algorithm name for detection being updated
        // {string} uuid - uuid for detection being updated
        // {string} className - new label className for detection being updated
        editDetectionLabel: (state, action) => {
            const { payload } = action;

            const updatedDetectionSet = DetectionSetUtil.updateDetectionLabelInSet(
                state.data[payload.algorithm],
                payload.uuid,
                payload.view,
                payload.className
            );

            state.data[payload.algorithm] = updatedDetectionSet;
        },

        deleteDetection: (state, action) => {
            const { payload } = action;

            const updatedDetectionSet = DetectionSetUtil.deleteDetectionFromSet(
                state.data[payload.algorithm],
                payload.view,
                payload.uuid
            );

            if (DetectionSetUtil.isEmpty(updatedDetectionSet)) {
                delete state.data[payload.algorithm];
            } else {
                state.data[payload.algorithm] = updatedDetectionSet;
            }
        },
        // Marks all DetectionSets as validated by the user
        validateDetections: (state) => {
            state.algorithmNames.forEach((algo) => {
                state.data[algo] = DetectionSetUtil.validateAllDetections(
                    state.data[algo]
                );
            });
        },

        // Update visibility on a DetectionSet
        // action payload should contain:
        // {string} algorithm - Name of algorithm for DetectionSet
        // {boolean} isVisible - whether the DetectionSet is visible or not
        updateDetectionSetVisibility: (state, action) => {
            try {
                const { payload } = action;

                const detectionSet = state.data[payload.algorithm];

                if (!detectionSet) {
                    throw new Error(
                        `DetectionSet visibility not updated. Check provided algorithm: ${payload.algorithm}`
                    );
                }

                const updatedDetectionSet = DetectionSetUtil.updateDetectionSetVisibility(
                    detectionSet,
                    payload.isVisible
                );

                state.data[payload.algorithm] = updatedDetectionSet;
            } catch (error) {
                console.error(error);
            }
        },
    },
});

// Selectors & Helper Functions
// These functions do not modify the Redux store in any way, just gets data

/**
 * Gets all unique class names from each Detection in each DetectionSet.
 * Used to populate the label list component for editing Detection labels
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @returns {Array<string>} array of all unique detection class names
 */
export const getDetectionLabels = (data) => {
    let classNames = [];

    for (const algo in data) {
        const labels = DetectionSetUtil.getClassNames(data[algo]);
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
        if (!DetectionSetUtil.isValidated(detectionSet)) {
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
    return DetectionUtil.getRenderColor(detection);
};

/**
 * Compare a Detection's properties with an object for equality.
 * @param {Object.<string, DetectionSet>} detections
 * @param {string} algorithm algorithm to reference Detection
 * @param {string} view view where Detection resides
 * @param {string} uuid Detection's uuid
 * @param {object} properties properties to compare on the original Detection
 * @returns {boolean} true if Detection's properties differ from the supplied properties
 */
export const hasDetectionChanged = (
    detections,
    algorithm,
    view,
    uuid,
    properties
) => {
    const detection = detections[algorithm].data[view].find(
        (detec) => detec.uuid === uuid
    );

    if (detection) {
        return DetectionUtil.hasDetectionChanged(detection, properties);
    }
};

export const {
    resetDetections,
    addDetectionSet,
    addDetection,
    clearSelectedDetection,
    clearAllSelection,
    selectDetection,
    selectDetectionSet,
    updateDetection,
    updatedDetectionSet,
    editDetectionLabel,
    deleteDetection,
    validateDetections,
    updateDetectionSetVisibility,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
