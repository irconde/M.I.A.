import { createSlice } from '@reduxjs/toolkit';
import * as constants from '../../../utils/Constants';
import randomColor from 'randomcolor';
import { v4 as uuidv4 } from 'uuid';
import Utils from '../../../utils/Utils';
import { Cookies } from 'react-cookie';

// interface Detection {
//     // Unique Identifier
//     uuid: string;
//     // Algorithm name - "Tiled 2.0", "OTAP" etc
//     algorithm: string;
//     // Apple, Orange, Banana, etc
//     className: string;
//     // A percentage value representing how confident that we have labeled the detection
//     // class name appropriately, IE we labeled it an Apple and we believe it to be an Apple by 86%
//     confidence: string;
//     // Wether the detection is selected and we can edit the detection
//     selected: boolean;
//     // If the detection is rendered in the Apps viewports
//     visible: boolean;
//     // What color to display the bounding box
//     color: string;
//     // Dictating what viewport the detection resides in, TOP or SIDE eg.
//     view: string;
//     // An array inside an array representing the polygon mask if there is one
//     polygonMask: number[[]];
//     // An array inside an array representing the binary mask if there is one
//     binaryMask: number[[]];
//     // The coordinates of the detection which are generally [x-start, y-start, x-end, y-end]
//     boundingBox: number[];
//     // Wether the detection is considered to valid. If a detection is not deleted before sending
//     // the file back to the image/command server, then is is considered to be validated.
//     validation: boolean;
//     // Decides what color should be displayed when rendering a detection
//     displayColor: string;
//     // Will be white if the detection is visible and gray if not visible
//     textColor: string;
// }

const myCookie = new Cookies();
const cookieData = myCookie.get('detections');
let missMatchedClassNames = [];
const storeCookieData = (classNames) => {
    myCookie.set('detections', classNames, {
        path: '/',
        maxAge: constants.COOKIE.TIME, // Current time is 3 hours
    });
};

if (cookieData !== undefined) {
    missMatchedClassNames = cookieData;
} else {
    storeCookieData(missMatchedClassNames);
}

const initialState = {
    detections: [],
    // Selection data
    /** @type string */
    selectedAlgorithm: '',
    /** @type Detection */
    selectedDetection: null,

    // As commented above
    /** @type Interface Detection */
    detectionLabels: [],
    detectionChanged: false,
    missMatchedClassNames,
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
            state.detectionChanged = false;
        },
        // Adds detection
        addDetection: (state, action) => {
            const {
                algorithm,
                className,
                confidence,
                view,
                binaryMask,
                polygonMask,
                boundingBox,
                uuid,
            } = action.payload;
            state.detections.push({
                algorithm,
                className,
                confidence,
                view,
                binaryMask,
                polygonMask,
                boundingBox,
                selected: false,
                visible: true,
                uuid,
                color: randomColor({
                    seed: className,
                    hue: 'random',
                    luminosity: 'bright',
                }),
                validation: null,
                textColor: 'white',
            });
            const foundIndex = state.missMatchedClassNames.findIndex(
                (el) => el.className === className
            );
            if (foundIndex !== -1) {
                state.detections[state.detections.length - 1].displayColor =
                    state.missMatchedClassNames[foundIndex].color;
                state.detections[state.detections.length - 1].color =
                    state.missMatchedClassNames[foundIndex].color;
            } else {
                state.detections[state.detections.length - 1].displayColor =
                    getDetectionColor(
                        state.detections[state.detections.length - 1]
                    );
            }
            if (state.detectionLabels.indexOf(className) === -1) {
                state.detectionLabels.push(className);
            }
            if (className === constants.commonDetections.UNKNOWN) {
                state.detectionChanged = true;
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
                    binaryMask: det.binaryMask,
                    polygonMask: det.polygonMask,
                    boundingBox: det.boundingBox,
                    selected: false,
                    visible: true,
                    uuid: uuidv4(),
                    color: randomColor({
                        seed: det.className,
                        hue: 'random',
                        luminosity: 'bright',
                    }),
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
            console.log('clear all reducer');
            state.detections.forEach((det) => {
                det.selected = false;
                if (det.visible) {
                    det.displayColor = det.color;
                    det.textColor = 'white';
                }
            });
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
                    const rgb = Utils.hexToRgb(
                        constants.detectionStyle.SELECTED_COLOR
                    );
                    det.displayColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                } else {
                    det.selected = false;
                    const rgb = Utils.hexToRgb(det.color);
                    det.displayColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
                }
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
                if (det.visible)
                    det.displayColor = getDetectionColor(det, action.payload);
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
                if (state.selectedDetection) {
                    if (state.selectedDetection.uuid === detection.uuid) {
                        state.selectedDetection = detection;
                        state.detectionChanged = true;
                    }
                }
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
                state.detectionChanged = true;
                if (state.detectionLabels.indexOf(className) === -1) {
                    state.detectionLabels.push(className);
                }
            }
        },
        // Deletes a detection.
        // Action payload should contain:
        // {string} uuid - uuid for detection being deleted
        deleteDetection: (state, action) => {
            state.detections = state.detections.filter((det) => {
                return det.uuid !== action.payload;
            });
            state.detectionChanged = true;
        },
        // Marks all DetectionSets as validated by the user
        validateDetections: (state) => {
            state.detections.forEach((det) => {
                det.validation = true;
                det.textColor = constants.detectionStyle.VALID_COLOR;
            });
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
                        if (state.selectedAlgorithm === algorithm) {
                            state.selectedAlgorithm = '';
                        }
                    }
                }
                if (det.visible) {
                    det.textColor = 'white';
                    det.displayColor = det.color;
                } else {
                    det.textColor = 'gray';
                    det.displayColor = 'black';
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
                        det.textColor = 'gray';
                        det.displayColor = 'black';
                    } else {
                        det.textColor = 'white';
                        det.displayColor = det.color;
                    }
                }
            });
        },
        /**
         * addMissMatchedClassName - For when a color is picked, it tests if that color is in the array
         *                           of miss matched class names. If it isn't, its name and corresponding color are added.
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object<className, color>} action Object containing the name of the detection and it's new color
         */
        addMissMatchedClassName: (state, action) => {
            const { className, color } = action.payload;
            const foundIndex = state.missMatchedClassNames.findIndex(
                (el) => el.className === className
            );
            if (foundIndex === -1) {
                state.missMatchedClassNames.push({ className, color });
            } else {
                state.missMatchedClassNames[foundIndex].color = color;
            }
            storeCookieData(state.missMatchedClassNames);
            state.missMatchedClassNames.forEach((missMatched) => {
                state.detections.forEach((det) => {
                    if (missMatched.className === det.className) {
                        det.color = missMatched.color;
                        if (det.uuid === state.selectedDetection.uuid) {
                            det.displayColor = missMatched.color;
                        }
                    }
                });
            });
            if (state.selectedDetection.className === className) {
                state.selectedDetection.color = color;
                state.selectedDetection.displayColor = color;
            }
        },
        /**
         * updateMissMatchedClassName - For when the color picker is closed, it will update all existing detections
         *                              with the same name as the color selected from the color picker
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        updateMissMatchedClassName: (state) => {
            state.missMatchedClassNames.forEach((missMatched) => {
                state.detections.forEach((det) => {
                    if (missMatched.className === det.className) {
                        det.color = missMatched.color;
                        if (det.uuid !== state.selectedDetection.uuid) {
                            det.displayColor = missMatched.color;
                        }
                    }
                });
            });
        },
    },
});

// Selectors Functions
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
 * hasDetectionCoordinatesChanged - Determines if the bounding box coordinates have changed from the passed in values to the stored ones
 * @param {Array<Detection>} detections
 * @param {String} uuid
 * @param {Array<Number>} boundingBox
 * @returns
 */
export const hasDetectionCoordinatesChanged = (
    detections,
    uuid,
    boundingBox,
    polygonMask
) => {
    const detection = detections.find((det) => det.uuid === uuid);
    if (detection) {
        let result = false;
        for (let i = 0; i < detection.boundingBox.length; i++) {
            if (detection.boundingBox[i] !== boundingBox[i]) {
                result = true;
                break;
            }
        }
        for (let j = 0; j < detection.polygonMask.length; j++) {
            if (
                detection.polygonMask[j].x !== polygonMask[j].x &&
                detection.polygonMask[j].y !== polygonMask[j].y
            ) {
                result = true;
                break;
            }
        }
        return result;
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
 * getSelectedDetectionColor
 * @param {Store} state Passed in via useSelector/mapDispatchToProps
 * @returns {String} The hex color of the detection
 */
export const getSelectedDetectionColor = (state) => {
    if (state.detections.selectedDetection !== null) {
        return state.detections.selectedDetection.color;
    } else {
        return '';
    }
};
export const getSelectedDetectionViewport = (state) => {
    if (state.detections.selectedDetection) {
        return state.detections.selectedDetection.view;
    }
};
export const getSelectedDetectionClassName = (state) => {
    if (state.detections.selectedDetection) {
        return state.detections.selectedDetection.className;
    }
};
export const getSelectedDetectionWidthAndHeight = (state) => {
    if (state.detections.selectedDetection) {
        const width = Math.abs(
            state.detections.selectedDetection.boundingBox[2] -
                state.detections.selectedDetection.boundingBox[0]
        );
        const height = Math.abs(
            state.detections.selectedDetection.boundingBox[3] -
                state.detections.selectedDetection.boundingBox[1]
        );
        return {
            width,
            height,
        };
    } else return null;
};
/**
 * getSelectedAlgorithm
 * @param {Store} state Passed in via useSelector/mapDispatchToProps
 * @returns {String} The currently selected algorithm
 */
export const getSelectedAlgorithm = (state) =>
    state.detections.selectedAlgorithm;

// Helper Functions

/**
 * Get color of detection for bounding box rendering
 * @param {Detection} detection
 * @returns {string} color in string form
 */
const getDetectionColor = (detection, uuid) => {
    if (detection.selected) return constants.detectionStyle.SELECTED_COLOR;
    if (detection.uuid !== uuid && uuid !== undefined) {
        const rgb = Utils.hexToRgb(detection.color);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
    }
    if (detection.validation !== null) {
        if (detection.validation) {
            return constants.detectionStyle.VALID_COLOR;
        }
        return constants.detectionStyle.INVALID_COLOR;
    }
    return detection.color;
};

export const getDetectionChanged = (state) => state.detections.detectionChanged;

export const {
    resetDetections,
    addDetectionSet,
    addDetection,
    addDetections,
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
    clearSelectedAlgorithm,
    updateDetectionColors,
    addMissMatchedClassName,
    updateMissMatchedClassName,
} = detectionsSlice.actions;

export default detectionsSlice.reducer;
