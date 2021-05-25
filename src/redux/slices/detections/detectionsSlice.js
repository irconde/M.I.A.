import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
import './util/typedef';
import DetectionSetUtil from './util/DetectionSet';
import DetectionUtil from './util/Detection';
import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid';

// interface Detection {
//     uuid: string;
//     algorithm: string;
//     className: string;
//     confidence: string;
//     selected: boolean;
//     visible: boolean;
//     color: string;
//     view: string;
//     maskBitmap: number[][];
//     boundingBox: number[];
//     lowerOpacity: boolean;
//     validation: boolean;
// }

const initialState = {
    // New State
    detections: [],

    // Old State
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
    detectionLabels: [],
};

const detectionsSlice = createSlice({
    name: 'detections',
    initialState,
    reducers: {
        // Reset store to default values
        resetDetections: (state) => {
            // TODO: Refactoring
            state.selectedAlgorithm = null;
            state.selectedDetection = null;
            state.algorithmNames = [];
            state.data = {};
            state.detections = [];
        },
        // Adds detection
        addDetection: (state, action) => {
            const {
                algorithm,
                className,
                confidence,
                view,
                maskBitmap,
                boundingBox,
            } = action.payload;
            state.detections.push({
                algorithm,
                className,
                confidence,
                view,
                maskBitmap,
                boundingBox,
                selected: false,
                visible: true,
                uuid: uuidv4(),
                color: randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                }),
                lowerOpacity: false,
                validation: false,
            });
            if (state.detectionLabels.indexOf(className) === -1) {
                state.detectionLabels.push(className);
            }
        },
        // Clears selection data for specified algorithm
        // Action payload should contain:
        // {string} algorithm - algorithm name
        clearSelectedDetection: (state, action) => {
            const detection = state.detections.filter(
                (det) => det.uuid === action.payload
            );
            detection.selected = false;
        },
        // Clears selection data for all DetectionSets and their Detections
        // No action payload used
        clearAllSelection: (state) => {
            state.detections.forEach((det) => {
                det.selected = false;
                det.lowerOpacity = false;
            });
            state.isEditLabelWidgetVisible = false;
            state.selectedDetection = null;
        },
        // Select a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        selectDetectionSet: (state, action) => {
            state.selectedDetection = null;
            state.detections.forEach((det) => {
                if (det.algorithm === action.payload) {
                    det.selected = true;
                } else {
                    det.selected = false;
                    det.lowerOpacity = true;
                }
            });
        },
        // Selects a detection from a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {string} view - where detection is rendered
        // {string} uuid - unique identifier for detection
        selectDetection: (state, action) => {
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.selected = true;
                    state.selectedDetection = det;
                } else {
                    det.selected = false;
                }
                det.lowerOpacity = !det.selected;
            });
        },
        // Update properties on a detection
        // Used for any action that is not selecting or deleting a detection
        // Action payload should contain:
        // {object} reference: contains uuid, algorithm, and view of detection to update
        // {object} update: contains any properties to update on the Detection
        updateDetection: (state, action) => {
            // TODO: Refactoring
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

        // Updates a Detection's class label.
        // Action payload should contain:
        // {string} algorithm - algorithm name for detection being updated
        // {string} uuid - uuid for detection being updated
        // {string} className - new label className for detection being updated
        editDetectionLabel: (state, action) => {
            // TODO: Refactoring
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
            state.detections = state.detections.filter((det) => {
                return det.uuid !== action.payload;
            });
        },
        // Marks all DetectionSets as validated by the user
        validateDetections: (state) => {
            state.detections.forEach((det) => (det.validation = true));
        },

        // Update visibility on a DetectionSet
        // action payload should contain:
        // {string} algorithm - Name of algorithm for DetectionSet
        // {boolean} isVisible - whether the DetectionSet is visible or not
        updateDetectionSetVisibility: (state, action) => {
            const { algorithm, isVisible } = action.payload;
            state.detections.forEach((det) => {
                if (det.algorithm === algorithm) {
                    det.visible = isVisible;
                }
            });
        },
        updateDetectionVisibility: (state, action) => {
            const { uuid, isVisible } = action.payload;
            state.detections.forEach((det) => {
                if (det.uuid === uuid) {
                    det.visible = isVisible;
                }
            });
        },
    },
});

// Selectors & Helper Functions
// These functions do not modify the Redux store in any way, just gets data

/**
 * Gets all unique class names from each Detection in each DetectionSet.
 * Used to populate the label list component for editing Detection labels
 * @param {Object.<string, DetectionSet>} state Redux Detections state
 * @returns {Array<string>} array of all unique detection class names
 */
export const getDetectionLabels = (state) => state.detections.detectionLabels;

/**
 * Determines if all detections in all detectionSets have been validated
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @returns {boolean} true if all are validated, false otherwise
 */
export const areDetectionsValidated = (data) => {
    // TODO: Refactoring
    let result = true;

    Object.values(data).forEach((detectionSet) => {
        if (!DetectionSetUtil.isValidated(detectionSet)) {
            result = false;
        }
    });

    return result;
};

/**
 * Get all Detections for the top view
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @param {string} view view to query
 * @returns {Array<Detection>}
 */
export const getTopDetections = (state) => {
    const topDetections = [];
    state.detections.detections.forEach((det) => {
        if (det.view === constants.viewport.TOP) {
            topDetections.push(det);
        }
    });
    return topDetections;
};

export const getSideDetections = (state) => {
    const sideDetections = [];
    state.detections.detections.forEach((det) => {
        if (det.view === constants.viewport.SIDE) {
            sideDetections.push(det);
        }
    });
    return sideDetections;
};

/**
 * Get color of detection for bounding box rendering
 * @param {Detection} detection
 * @returns {string} color in string form
 */
export const getDetectionColor = (detection) => {
    // TODO: Refactoring - can probably just have a key value pair on the detection
    //                     for its color rather than making more calls to the store
    if (detection.selected) return constants.detectionStyle.SELECTED_COLOR;
    if (detection.validation !== null) {
        if (detection.validation) {
            return constants.detectionStyle.VALID_COLOR;
        }
        return constants.detectionStyle.INVALID_COLOR;
    }
    return detection.color;
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
    // TODO: Refactoring
    const detection = detections[algorithm].data[view].find(
        (detec) => detec.uuid === uuid
    );

    if (detection) {
        return DetectionUtil.hasDetectionChanged(detection, properties);
    }
};

export const getDetectionsByAlgorithm = (state) => {
    const sorted = state.detections.detections.sort((a, b) => {
        if (a.algorithm === b.algorithm) {
            return true;
        } else {
            return false;
        }
    });
    const response = [];
    let preparedAlgorithm = [];
    let currentAlgorithm = '';
    sorted.forEach((det) => {
        let priorAlgorithm = currentAlgorithm;
        currentAlgorithm = det.algorithm;
        if (priorAlgorithm === currentAlgorithm) {
            preparedAlgorithm.push(det);
        } else {
            response.push(preparedAlgorithm);
            preparedAlgorithm = [];
            preparedAlgorithm.push(det);
        }
    });
    console.log(response);
    return response;
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
    updateDetectionVisibility,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
