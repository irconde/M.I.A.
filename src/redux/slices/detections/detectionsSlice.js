import { createSlice, current } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
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
    detections: [],
    // Selection data
    /** @type string */
    selectedAlgorithm: null,
    /** @type Detection */
    selectedDetection: null,
    /** @type Array<string> */
    algorithmNames: [],

    // Normal detectionSet data using the algorithm name as the key and the detectionSet as the value
    /** @type Object<string, DetectionSet> */
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
                uuid,
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
                uuid,
                color: randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                }),
                lowerOpacity: false,
                validation: null,
            });
            if (state.detectionLabels.indexOf(className) === -1) {
                state.detectionLabels.push(className);
            }
        },
        // Adds detection
        addDetections: (state, action) => {
            action.payload.forEach((det) => {
                state.detections.push({
                    algorithm: det.algorithm,
                    className: det.className,
                    confidence: det.confidence,
                    view: det.view,
                    maskBitmap: det.maskBitmap,
                    boundingBox: det.boundingBox,
                    selected: false,
                    visible: true,
                    uuid: uuidv4(),
                    color: randomColor({
                        seed: det.className,
                        hue: 'random',
                        luminosity: 'bright',
                    }),
                    lowerOpacity: false,
                    validation: null,
                });
                if (state.detectionLabels.indexOf(det.className) === -1) {
                    state.detectionLabels.push(det.className);
                }
            });
        },
        // Clears selection data for specified algorithm
        // Action payload should contain:
        // {string} algorithm - algorithm name
        clearSelectedDetection: (state, action) => {
            const detection = state.detections.find(
                (det) => det.uuid === action.payload
            );
            detection.selected = false;
            detection.updatingDetection = false;
        },
        // Clears selection data for all DetectionSets and their Detections
        // No action payload used
        clearAllSelection: (state) => {
            state.detections.forEach((det) => {
                det.selected = false;
                det.lowerOpacity = false;
                det.updatingDetection = false;
            });
            state.isEditLabelWidgetVisible = false;
            state.selectedDetection = null;
            state.selectedAlgorithm = null;
        },
        // Select a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        selectDetectionSet: (state, action) => {
            state.selectedDetection = null;
            state.selectedAlgorithm = action.payload;
            state.detections.forEach((det) => {
                if (det.algorithm === action.payload) {
                    det.selected = true;
                } else {
                    det.selected = false;
                }
                det.lowerOpacity = !det.selected;
                det.updatingDetection = false;
            });
        },
        clearSelectedAlgorithm: (state) => {
            state.selectedAlgorithm = null;
        },
        // Selects a detection from a DetectionSet
        // Action payload should contain:
        // {string} algorithm - algorithm name
        // {string} view - where detection is rendered
        // {string} uuid - unique identifier for detection
        selectDetection: (state, action) => {
            state.selectedAlgorithm = null;
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.selected = true;
                    state.selectedDetection = det;
                } else {
                    det.selected = false;
                }
                det.lowerOpacity = !det.selected;
                det.updatingDetection = det.selected;
            });
        },
        menuSelectDetection: (state, action) => {
            state.selectedAlgorithm = null;
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.selected = true;
                    state.selectedDetection = det;
                } else {
                    det.selected = false;
                }
                det.lowerOpacity = !det.selected;
                det.updatingDetection = false;
            });
        },
        // Update properties on a detection
        // Used for any action that is not selecting or deleting a detection
        // Action payload should contain:
        // {object} reference: contains uuid, algorithm, and view of detection to update
        // {object} update: contains any properties to update on the Detection
        updateDetection: (state, action) => {
            const { uuid, update } = action.payload;
            let detection = state.detections.find((det) => det.uuid === uuid);
            if (detection !== undefined) {
                for (let key in update) detection[key] = update[key];
            }
        },

        // Updates a Detection's class label.
        // Action payload should contain:
        // {string} algorithm - algorithm name for detection being updated
        // {string} uuid - uuid for detection being updated
        // {string} className - new label className for detection being updated
        editDetectionLabel: (state, action) => {
            const { uuid, className } = action.payload;
            let detection = state.detections.find((det) => det.uuid === uuid);
            if (detection) {
                detection.className = className;
                detection.color = randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                });
            }
        },

        deleteDetection: (state, action) => {
            state.detections = state.detections.filter((det) => {
                return det.uuid !== action.payload;
            });
            console.log(current(state));
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
                    if (isVisible === false) {
                        det.selected = false;
                        det.updatingDetection = false;
                        det.lowerOpacity = false;
                        if (state.selectedAlgorithm === algorithm) {
                            state.selectedAlgorithm = null;
                        }
                    } else if (
                        isVisible === true &&
                        algorithm !== state.selectedAlgorithm &&
                        state.selectedAlgorithm !== null
                    ) {
                        det.lowerOpacity = true;
                    }
                } else if (isVisible === false && det.algorithm !== algorithm) {
                    det.lowerOpacity = false;
                }
            });
        },
        updateDetectionVisibility: (state, action) => {
            state.detections.forEach((det) => {
                if (det.uuid === action.payload) {
                    det.visible = !det.visible;
                    if (det.visible === false) {
                        det.selected = false;
                        det.updatingDetection = false;
                        det.lowerOpacity = false;
                    }
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

    // Object.values(data).forEach((detectionSet) => {
    //     if (!DetectionSetUtil.isValidated(detectionSet)) {
    //         result = false;
    //     }
    // });

    return result;
};

/**
 * Get all Detections for the top view
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @param {string} view view to query
 * @returns {Array<Detection>}
 */
export const getTopDetections = (detections) => {
    const topDetections = [];
    if (detections !== undefined) {
        detections.forEach((det) => {
            if (det.view === constants.viewport.TOP) {
                topDetections.push(det);
            }
        });
    }
    return topDetections;
};

export const getSideDetections = (detections) => {
    const sideDetections = [];
    if (detections !== undefined) {
        detections.forEach((det) => {
            if (det.view === constants.viewport.SIDE) {
                sideDetections.push(det);
            }
        });
    }
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

export const hasDetectionCoordinatesChanged = (
    detections,
    uuid,
    boundingBox
) => {
    const detection = detections.find((det) => det.uuid === uuid);
    if (detection) {
        if (detection.boundingBox === boundingBox) {
            return false;
        } else {
            return true;
        }
    }
};

export const getDetectionsByAlgorithm = (state) => {
    const sorted = state.detections.detections.slice().sort((a, b) => {
        if (a.algorithm < b.algorithm) {
            return -1;
        }
        if (a.algorithm > b.algorithm) {
            return 1;
        }
        return 0;
    });
    const response = [];
    let prepared = [];
    let priorAlgorithm = sorted.length > 0 ? sorted[0].algorithm : '';
    sorted.forEach((det) => {
        const currentAlgorithm = det.algorithm;
        if (priorAlgorithm === currentAlgorithm) {
            prepared.push(det);
        } else {
            response.push(prepared);
            prepared = [];
            prepared.push(det);
        }
        priorAlgorithm = currentAlgorithm;
    });
    if (prepared.length > 0) response.push(prepared);
    return response;
};

export const getSelectedDetection = (state) =>
    state.detections.selectedDetection;
export const getSelectedAlgorithm = (state) =>
    state.detections.selectedAlgorithm;

export const {
    resetDetections,
    addDetectionSet,
    addDetection,
    addDetections,
    clearSelectedDetection,
    clearAllSelection,
    selectDetection,
    menuSelectDetection,
    selectDetectionSet,
    updateDetection,
    updatedDetectionSet,
    editDetectionLabel,
    deleteDetection,
    validateDetections,
    updateDetectionSetVisibility,
    updateDetectionVisibility,
    clearSelectedAlgorithm,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
