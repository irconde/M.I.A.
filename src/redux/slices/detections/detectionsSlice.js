import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../Constants';
import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid';

// interface Detection {
//     // Unique Identifier
//     uuid: string;
//     // Algorithm name - "Tiled 2.0", "OTAP" etc
//     algorithm: string;
//     // Apple, Orange, Banana, etc
//     className: string;
//     // A percentage value representing how confident that we have labeled the detection
//     // class name appropriately, IE we labeled it an Apple and we believe it to be an Apple by 86%
//     confidence: string;s
//     // Wether the detection is selected and we can edit the detection
//     selected: boolean;
//     // If the detection is rendered in the Apps viewports
//     visible: boolean;
//     // What color to display the bounding box
//     color: string;
//     // Dictating what viewport the detection resides in, TOP or SIDE eg.
//     view: string;
//     // An array inside an array representing the polygon mask if there is one
//     maskBitmap: number[[]];
//     // The coordinates of the detection which are generally [x-start, y-start, x-end, y-end]
//     boundingBox: number[];
//     // This is based on if another detection is selected and the App should not render the bounding box
//     // at full opacity.
//     lowerOpacity: boolean;
//     // Wether the detection is considered to valid. If a detection is not deleted before sending
//     // the file back to the image/command server, then is is considered to be validated.
//     validation: boolean;
// }

const initialState = {
    detections: [],
    // Selection data
    /** @type string */
    selectedAlgorithm: '',
    /** @type Detection */
    selectedDetection: null,

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
            state.selectedAlgorithm = '';
            state.selectedDetection = null;
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
        // Adds detections
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
        // Clears selection data for all detections
        // No action payload used
        clearAllSelection: (state) => {
            state.detections.forEach((det) => {
                det.selected = false;
                det.lowerOpacity = false;
                det.updatingDetection = false;
            });
            state.isEditLabelWidgetVisible = false;
            state.selectedDetection = null;
            state.selectedAlgorithm = '';
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
        // Resets the selected algorithm
        clearSelectedAlgorithm: (state) => {
            state.selectedAlgorithm = '';
        },
        // Selects a detection
        // Action payload should contain:
        // {string} uuid - unique identifier for detection
        selectDetection: (state, action) => {
            state.selectedAlgorithm = '';
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
        // Menu selection of detection
        // Action payload should contain:
        // {string} uuid - unique identifier for detection
        menuSelectDetection: (state, action) => {
            state.selectedAlgorithm = '';
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
        // {object} uuid of detection to update
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
        // Deletes a detection.
        // Action payload should contain:
        // {string} uuid - uuid for detection being deleted
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
                    if (isVisible === false) {
                        det.selected = false;
                        det.updatingDetection = false;
                        det.lowerOpacity = false;
                        if (state.selectedAlgorithm === algorithm) {
                            state.selectedAlgorithm = '';
                        }
                    } else if (
                        isVisible === true &&
                        algorithm !== state.selectedAlgorithm &&
                        state.selectedAlgorithm !== ''
                    ) {
                        det.lowerOpacity = true;
                    }
                } else if (isVisible === false && det.algorithm !== algorithm) {
                    det.lowerOpacity = false;
                }
            });
        },
        // Update visibility on a Detection
        // action payload should contain:
        // {string} uuid - id of detection
        // {boolean} isVisible - whether the DetectionSet is visible or not
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
 * Get all Detections for the top view
 * @param {Object.<string, DetectionSet>} data Redux Detections state
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

/**
 * Get all Detections for the side view
 * @param {Object.<string, DetectionSet>} data Redux Detections state
 * @returns {Array<Detection>}
 */
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
/**
 * hasDetectionCoordinatesChanged - Determines if the bounding box coordinates have changed from the passed in values to the stored ones
 * @param {Array<Detection>} detections
 * @param {String} uuid
 * @param {Array<Number>} boundingBox
 * @returns
 */
export const hasDetectionCoordinatesChanged = (
    detections,
    uuid,
    boundingBox
) => {
    const detection = detections.find((det) => det.uuid === uuid);
    if (detection) {
        let equality = true;
        for (let i = 0; i < detection.boundingBox.length; i++) {
            if (detection.boundingBox[i] !== boundingBox[i]) {
                equality = false;
                break;
            }
        }
        return equality;
    }
};

/**
 * getDetectionsByAlgorithm - Sorts and organizes the detections into arrays based on algorithm name
 *                            Returns the array of detections by algorithm in an array.
 * @param {Store} state Passed in via useSelector/mapDispatchToProps
 * @returns {Array<Array<Detection>>} - Array containing arrays of each algorithm
 */
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

/**
 * getSelectedDetection
 * @param {Store} state Passed in via useSelector/mapDispatchToProps
 * @returns {Detection} The currently selected detection
 */
export const getSelectedDetection = (state) =>
    state.detections.selectedDetection;

/**
 * getSelectedAlgorithm
 * @param {Store} state Passed in via useSelector/mapDispatchToProps
 * @returns {String} The currently selected algorithm
 */
export const getSelectedAlgorithm = (state) =>
    state.detections.selectedAlgorithm;

export const {
    resetDetections,
    addDetectionSet,
    addDetection,
    addDetections,
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
